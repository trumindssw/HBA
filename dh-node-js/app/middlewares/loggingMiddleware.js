/***
 *
 * Middleware for saving logs.
 * 
 */

const { sendLogs } = require("../services/logger.service");

const saveLogs = (req, res, next) => {
    const requestStart = Date.now();
    var oldWrite = res.write,
        oldEnd = res.end;
    let chunks = [];
    res.write = function (chunk) {
        chunks.push(chunk);
        return oldWrite.apply(res, arguments);
    };
    res.end = function (data) {
        let resBody;
        if (data) {
            const newData = [];
            newData.push(data);
            try {
                resBody = JSON.parse(Buffer.concat(newData).toString("utf-8"));
            }
            catch (e) {
                resBody = data.toString("utf-8");
            }
        }

        const {
            rawHeaders,
            httpVersion,
            method,
            socket,
            url,
            path,
            body: requestBody,
            params: requestParams,
            query: requestQuery,
        } = req;
        const { remoteAddress, remoteFamily } = socket;

        const { statusCode, statusMessage } = res;
        const headers = res.getHeaders();

        if (path.includes("login") && requestBody.hasOwnProperty("password")) {
            delete requestBody.password;
        }

        const loggingData = {
            timestamp: new Date(),
            processingTime: Date.now() - requestStart,
            processingTimeUnit: "ms",
            rawHeaders,
            httpVersion,
            remoteAddress,
            remoteFamily,
            method,
            path,
            requestParams,
            requestQuery,
            requestBody,
            response: {
                statusCode,
                body: resBody,
                headers,
            },
        };

        if (statusCode === 200 || statusCode === 201 || statusCode === 202) {
            loggingData["level"] = "access";
        }
        else {
            loggingData["level"] = "error";
        }

        // if (path !== "/health-check") {
        //     sendLogs(loggingData);
        // }

        oldEnd.apply(res, arguments);
    };
    next();
};

module.exports = {
    saveLogs
};
