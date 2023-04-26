const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require('moment');

const dB = require('../models');
const { getNextChar } = require("../helpers/util.helper");
const { logger } = require('../config/logger/logger');
const Subject = dB.subjects;
const Request = dB.requests;

const verify = (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      var status;
      var statusMessage;
      var request = [];
      //check whether the req.body is empty or not
      if (body.constructor === Object && Object.keys(body).length === 0) {
        logger.warn(`Please send subject's detail to verify`)
        return reject({
          message: "Please send subject's detail to verify...",
        });
      }
      logger.info(`Request Body ::: ${JSON.stringify(body)}`)
      var arr = JSON.parse(JSON.stringify(body));
      logger.info(`Requests to be processed ::: ${arr.length}`)
      var reqId = await getRequestIDFromDB();

      for (let ind = 0; ind < arr.length; ind++) {
        logger.info(`Processing ::: ${reqId}`)
        let index = arr[ind];
        if (index) {
          var firstName = index.firstName;
          var lastName = index.lastName;
          var issuingAuthority = index.issuingAuthority;
          var document = index.document;
          var startDate = index.startDate;
          var endDate = index.endDate;

          if (!(firstName && lastName && issuingAuthority && document && startDate && endDate)) {
            logger.error(`Missing field in the request`)
            return reject("Missing field!!");
          }
          const found = await Subject.findOne({
            where: {
              [Op.and]:
                [{ firstName: firstName }, { lastName: lastName }, { issuingAuthority: issuingAuthority },
                Sequelize.where(Sequelize.fn('date', Sequelize.col('startDate')), '=', startDate),
                { document: document },
                Sequelize.where(Sequelize.fn('date', Sequelize.col('endDate')), '=', endDate)]
            }
          })
          if (found != null) {
            status = 1;
            statusMessage = "Verified";
            logger.info(`Subject is verified`)
          } else {
            status = 0;
            statusMessage = "Not Verified";
            logger.info(`Subject is not verified`)
          }
          let req = {
            requestID: reqId,
            subjectName: firstName,
            status: status,
            statusMessage: statusMessage,
          };
          request.push(req);
          reqId = await getNextRequestID(reqId);
        }
        else {
          logger.error(`Error in request ${reqId}`)
          return reject({
            message: "Error in request" + reqId,
          });
        }
      }
      Request.bulkCreate(request).then(() => {
        logger.info(`Inserted the requests in db successfully`)
        return resolve({
          message: "Inserted the request..",
          data: request,
        });
      })
    } catch (error) {
      console.log(error);
      logger.error(`Could not verify the subject`)
      return reject({
        message: "Could not verify the subject... " + error,
      });
    }
  })
}


// Return the next request id 

const getNextRequestID = (reqId) => {
  return new Promise((resolve, reject) => {
    try {
      logger.info(`::: Inside getNextRequestID :::`)
      let veriflowId = process.env.VERIFLOW_ID;
      logger.info(`VeriflowId ::: ${veriflowId}`)
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
        reqId = veriflowId + chars + digits;
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
      let veriflowId = process.env.VERIFLOW_ID;
      let requestId = '';
      const request = await Request.findOne({
        order: [['requestID', 'DESC']]
      })
      if (!request) {
        requestId = requestId + veriflowId + 'AA0001';
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

const getAllRequests = (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Params ::: ${JSON.stringify(params)}`)
      let page = parseInt(params && params["page"]) || 1,
        limit = parseInt(params && params["limit"]) || 10,
        offset = (page - 1) * limit || 0, requests;
      logger.info(`Page ::: ${page} ; Limit ::: ${limit} ; Offset ::: ${offset}`);
      let condition = {};
      if (params && params["status"]) {
        let status = params["status"];
        Object.assign(condition, { status: status });
      }
      if (params && params["lastWeek"]) {
        Object.assign(condition, { createdAt: { [Op.gte]: moment().subtract(7, 'days').toDate() } });
      }
      if (params && params["lastMonth"]) {
        Object.assign(condition, { createdAt: { [Op.gte]: moment().subtract(30, 'days').toDate() } });
      }
      if (params && params["startDate"] && params["endDate"]) {
        let startDate = params["startDate"];
        let endDate = params["endDate"];
        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        logger.info(`Requests from ${startDate} to ${endDate}`)
        Object.assign(condition, {
          createdAt: {
            [Op.between]: [new Date(startDate).toISOString(), new Date(endDate).toISOString()]
          }
        });
      }
      requests = await Request.findAll({
        where: { [Op.and]: condition },
        "page": page,
        "limit": limit,
        "offset": offset
      });
      logger.info(`requests ::: ${requests.length}`)
      let totalCount = await Request.count();
      logger.info(`TotalCount ::: ${totalCount}`)
      if (requests) {
        return resolve({
          data: requests,
          total: totalCount
        });
      } else {
        logger.info(`There are no previous requests`);
        return reject({
          message: "there are no previous requests...",
        });
      }
    } catch (error) {
      logger.error(`Could not get the requests ${error}`)
      return reject({
        message: "Could not get the requests ",
      });
    }
  })
}


const getRequestDetail = (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Params ::: ${params.reqId}`)
      let requestDetail = await Request.findOne({ where: { requestID: params.reqId } });
      logger.info(`Request ::: ${JSON.stringify(requestDetail)}`)
      if (requestDetail) {
        return resolve({
          message: "Request is...",
          data: requestDetail,
        });
      } else {
        logger.error(`No request with reqId ::: ${reqId}`)
        return reject({
          message: "There is no such request...",
        });
      }
    } catch (error) {
      logger.error(`Could not get the requests ${error}`)
      return reject({
        message: "Could not get the request ",
      });
    }
  })
}

const getRequestCounts = () => {
  return new Promise((resolve, reject) => {
    try {
      let response = {};
      response.avgReqPerDay = 10;
      response.avgReqPerDayvsLastWeek = -28;

      response.avgReqPerWeek = 20;
      response.avgReqPerWeekvsLastWeek = -29;

      response.totalReq = 30;
      response.totalReqvsLastWeek = 8;

      response.totalReqWithSubjectFound = 20;
      response.totalReqWithSubjectFoundvsLastWeek = 4;

      response.totalReqWithMismatch = 10;
      response.totalReqWithMismatchvsLastWeek = 11;
      logger.info(`response ::: ${response}`)
      return resolve(response);

    } catch (err) {
      return reject(err);
    }
  })
}

module.exports = {
  verify,
  getAllRequests,
  getRequestDetail,
  getRequestCounts
}
