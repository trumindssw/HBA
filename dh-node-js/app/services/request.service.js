const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require('moment');

const dB = require('../models');
const { getNextChar } = require("../helpers/util.helper");
const { logger } = require('../config/logger/logger');
const { requestObject } = require('../helpers/request.helper');
const Subject = dB.subjects;
const Request = dB.requests;
let VERIFLOW_ID = process.env.VERIFLOW_ID;


const verify = (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      var status, statusCode;
      var statusMessage;
      var request = [];
      let req;

      var reqId = await getRequestIDFromDB();

      //check whether the req.body is empty or not
      if (body == undefined || !(Array.isArray(body)) || body.length <= 0) {
        logger.warn(`Please send subject's detail to verify`)
        req = requestObject(reqId, VERIFLOW_ID, null, null, null, null, null, null, null, 500, -1);
        request.push(req);
      }
      else {
        logger.info(`Request Body ::: ${JSON.stringify(body)}`)
        var arr = body;
        logger.info(`Requests to be processed ::: ${arr.length}`)

        for (let ind = 0; ind < arr.length; ind++) {
          logger.info(`Processing ::: ${reqId}`)
          let obj = arr[ind];
          var firstName = obj.firstName;
          var lastName = obj.lastName;
          var issuingAuthority = obj.issuingAuthority;
          var document = obj.document;
          var department = obj.department;
          var startDate = obj.startDate;
          var endDate = obj.endDate;

          if (!(firstName && lastName && issuingAuthority && document && department && startDate && endDate)) {
            logger.error(`Missing field in the request`)
            req = requestObject(reqId, VERIFLOW_ID, firstName, lastName, issuingAuthority, document, department, startDate, endDate, 500, -1);
          }
          else {
            const found = await Subject.findOne({
              where: {
                [Op.and]:
                  [Sequelize.where(Sequelize.fn('lower', Sequelize.col('firstName')), '=', firstName.toLowerCase()),
                  Sequelize.where(Sequelize.fn('lower', Sequelize.col('lastName')), '=', lastName.toLowerCase()),
                  Sequelize.where(Sequelize.fn('lower', Sequelize.col('issuingAuthority')), '=', issuingAuthority.toLowerCase()),
                  Sequelize.where(Sequelize.fn('lower', Sequelize.col('document')), '=', document.toLowerCase()),
                  Sequelize.where(Sequelize.fn('lower', Sequelize.col('department')), '=', department.toLowerCase()),
                  Sequelize.where(Sequelize.fn('date', Sequelize.col('startDate')), '=', startDate),
                  Sequelize.where(Sequelize.fn('date', Sequelize.col('endDate')), '=', endDate)]
              }
            })
            if (found != null) {
              statusCode = 200;
              status = 1
              logger.info(`Match Found`)
            } else {
              statusCode = 200;
              status = 0
              logger.info(`Match Not Found`)
            }
            req = requestObject(reqId, VERIFLOW_ID, firstName, lastName, issuingAuthority, document, department, startDate, endDate, statusCode, status);
          }
          request.push(req);
          reqId = await getNextRequestID(reqId);
        }
      }
      Request.bulkCreate(request).then(() => {
        logger.info(`Inserted the requests in db successfully`)
        return resolve({
          message: "Inserted the request",
          data: request,
        });
      })
    } catch (error) {
      console.log(error);
      logger.error(`Error in verify ::: ${error}`)
      return reject({
        message: "Error in verify ::: " + error,
      });
    }
  })
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
        where:{
          veriflowID : VERIFLOW_ID
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
        condition.status = status;
      }
      if (params && params["lastWeek"]) {
        condition.createdAt = { [Op.gte]: moment().subtract(7, 'days').toDate() }
      }
      if (params && params["lastMonth"]) {
        condition.createdAt = { [Op.gte]: moment().subtract(30, 'days').toDate() }
      }
      if (params && params["startDate"] && params["endDate"]) {
        let startDate = params["startDate"];
        let endDate = params["endDate"];
        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        logger.info(`Requests from ${startDate} to ${endDate}`)
        condition.createdAt = { [Op.between]: [new Date(startDate).toISOString(), new Date(endDate).toISOString()] }
      }

      requests = await Request.findAll({
        where: { [Op.and]: condition },
        order: [['createdAt', 'DESC']],
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
          message: "There are no previous requests",
        });
      }
    } catch (error) {
      logger.error(`Could not get the requests ${error}`)
      return reject({
        message: "Could not get the requests : " + error,
      });
    }
  })
}


const getRequestDetail = (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      let requestDetail = [];
      logger.info(`Params ::: ${params.reqId}`)
      let requestStatus = await Request.findOne({
        where: { requestID: params.reqId }, attributes: ['requestID', 'veriflowID', 'subjectName',
          'issuingAuthority', 'document', 'department', [Sequelize.literal('extract(YEAR FROM "startDate")'), 'startYear'],
          [Sequelize.literal('extract(YEAR FROM "endDate")'), 'endYear'], 'status']
      });
      logger.info(`Request ::: ${JSON.stringify(requestStatus)}`)

      const keyMap = {
        'requestID': 'Request ID',
        'veriflowID': 'Veriflow ID',
        'subjectName': 'Subject Name',
        'issuingAuthority': 'Issuing Authority',
        'document': 'Document',
        'department': 'Department',
        'startYear': 'Start Year',
        'endYear': 'End Year',
        'status' : 'status'
      }

      if (requestStatus && requestStatus.dataValues ) {
        for (var key in requestStatus.dataValues) {
          requestDetail.push({ "key": keyMap[key], "value": requestStatus.dataValues[key], "checked": requestStatus.dataValues.status })
        }
        return resolve({
          message: "Request is...",
          data: requestDetail,
        });
      }
      else {
        logger.error(`No request with reqId ::: ${reqId}`)
        return reject({
          message: "There is no such request with request id : " + reqId,
        });
      }
    } catch (error) {
      logger.error(`Could not get the requests ${error}`)
      return reject({
        message: "Could not get the request : " + error,
      });
    }
  })
}

const getRequestCounts = () => {
  return new Promise((resolve, reject) => {
    try {
      let response = {};
      let avgReqPerDayQuery = `
      SELECT (COUNT(*)::float)/(MAX("createdAt"::date)-min("createdAt"::date)+1) FROM hba.requests`;
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
      logger.info(`response ::: ${JSON.stringify(response)}`)
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
