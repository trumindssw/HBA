/**
 * Middleware for handling the response of API
 *
 */


//handle errors responses
const { handleError } = require("./errorHandler");

//handle success responses
const handleResponse = (req, res, data) => {
    if (
        req.method === "GET" ||
        (req.method === "POST" && req?.url?.includes("search"))
    ) {
        res
            .status(200)
            .send({ status: true, message: data.message, data: data["data"] });
    }
    else if (req.method === "POST") {
        res
            .status(201)
            .send({ status: true, message: data.message, data: data["data"] });
    }
    else if (req.method === "PATCH") {
        res
            .status(200)
            .send({ status: true, message: data.message, data: data["data"] });
    }
    else if (req.method === "DELETE") {
        res
            .status(202)
            .send({ status: true, message: data.message, data: data["data"] });
    }
};

module.exports = function promiseMiddleware() {
    return (req, res, next) => {
        res.promise = (p) => {
            let promiseToResolve;
            if (p.then && p.catch) {
                promiseToResolve = p;
            }
            else if (typeof p === "function") {
                promiseToResolve = Promise.resolve().then(() => p());
            }
            else {
                promiseToResolve = Promise.resolve(p);
            }

            return promiseToResolve
                .then((data) => {
                    handleResponse(req, res, data);
                })
                .catch((err) => {
                    handleError(res, err);
                });
        };

        return next();
    };
};
