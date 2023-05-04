const { logger } = require("../config/logger/logger");
const { getNextChar } = require("../helpers/util.helper");
const dB = require('../models');

const Request = dB.requests;
let VERIFLOW_ID = process.env.VERIFLOW_ID;

const requestObject = (reqId, veriflowId, firstName, lastName, issuingAuthority,
    document, department, startDate, endDate, statusCode, status) => {
    try {
        let req = {
            requestID: reqId,
            veriflowID: veriflowId,
            subjectName: (firstName && lastName) ? firstName + " " + lastName : ((firstName) ? firstName : (lastName) ? lastName : null),
            issuingAuthority: issuingAuthority ? issuingAuthority : null,
            document: document ? document : null,
            department: department ? department : null,
            startDate: startDate ? startDate : null,
            endDate: endDate ? endDate : null,
            statusCode: statusCode,
            status: status,
            statusMessage: (status == -1) ? 'Internal Server Error' : ((status == 0) ? 'Match Not found' : 'OK'),
        };
        return req;
    } catch (err) {
        console.log(err);
    }
}


// Return the next request id 

const getNextRequestID = (reqId) => {
    return new Promise((resolve, reject) => {
        try {
            logger.info(`::: Inside getNextRequestID :::`)
            logger.info(`VeriflowId ::: ${VERIFLOW_ID}`)
            let strLength = reqId && reqId.length;
            //strLength = 5
            if (strLength > 6) {
                let digits = parseInt(reqId.slice(strLength - 4));
                let chars = reqId.slice(strLength - 6, strLength - 4);
                if (digits && digits < 9999) {
                    digits += 1;
                } else {
                    digits = '0001';
                    let ch1 = '';
                    let ch2 = '';
                    if (chars && chars[1] < 'Z' && chars[1] >= 'A') {
                        ch1 = chars[0];
                        ch2 = getNextChar(chars[1]);
                    } else if (chars && chars[1] == 'Z') {
                        ch2 = 'A';
                        ch1 = getNextChar(chars[0]);
                    }
                    if (ch1 >= 'A' && ch1 <= 'Z' && ch2 >= 'A' && ch2 <= 'Z') {
                        chars = ch1 + ch2;
                    } else {
                        logger.error(`RequestId limit reached`)
                        return reject("RequestId limit reached!!!");
                    }
                }
                digits = "0".repeat(4 - digits.toString().length) + digits;
                reqId = VERIFLOW_ID + chars + digits;
                logger.info(`Next RequestId ::: ${reqId}`)
                return resolve(reqId);
            } else {
                logger.error(`Invalid RequestID`)
                return reject("Invalid RequestID");
            }
        } catch (err) {
            logger.error(`Error ::: ${err}`)
            console.log(err);
        }
    })
}

//Return the reqId from the database which is the latest

const getRequestIDFromDB = () => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info(`::: Inside getRequestIDFromDB :::`)
            let requestId = '';
            const request = await Request.findOne({
                attributes: ['requestID'],
                order: [['requestID', 'DESC']],
                where: {
                    veriflowID: VERIFLOW_ID
                }
            })
            if (!request) {
                requestId = requestId + VERIFLOW_ID + 'AA0001';
            } else {
                requestId = request.requestID;
                //requestId = 'DU100ZZ9999'
                requestId = await getNextRequestID(requestId);
            }
            logger.info(`RequestId ::: ${requestId}`)
            resolve(requestId);

        } catch (err) {
            logger.error(`Error ::: ${err}`)
            reject(err)
        }
    })
}

module.exports = {
    requestObject,
    getNextRequestID,
    getRequestIDFromDB
}