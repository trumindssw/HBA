const Sequelize = require("sequelize");
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

const dB = require('../models');
const { logger } = require('../config/logger/logger');
const { requestObject, getNextRequestID, getRequestIDFromDB } = require('../helpers/request.helper');
const Subject = dB.subjects;
const Request = dB.requests;
let VERIFLOW_ID = process.env.VERIFLOW_ID;


const verify = (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      var status, statusCode;
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

const getAllRequests = (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Body ::: ${JSON.stringify(body)}`)

      let page = body && body.page && Number(body.page) || 1;
      let limit = body && body.limit && Number(body.limit) || 10;
      let status = body && body.status && Number(body.status);
      let lastWeek = body && body.lastWeek;
      let lastMonth = body && body.lastMonth;
      let startDate = body && body.startDate;
      let endDate = body && body.endDate;
      let searchValue = body && body.searchValue;
      let sortKey = body && body.sortKey || 'createdAt';
      let sortValue = body && body.sortValue || 'DESC';
      let offset = (page - 1) * limit || 0, requests = [];

      logger.info(`Page ::: ${page} ; Limit ::: ${limit} ; Offset ::: ${offset}`);
      let condition = [];
      if (status != null) {
        condition.push({ "status": status });
      }
      if (lastWeek) {
        condition.push({ "createdAt": { [Op.gte]: moment().subtract(7, 'days').toDate() } });
      }
      if (lastMonth) {
        condition.push({ "createdAt": { [Op.gte]: moment().subtract(30, 'days').toDate() } });
      }
      if (startDate && endDate) {
        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        logger.info(`Requests from ${startDate} to ${endDate}`)
        condition.push({ "createdAt": { [Op.between]: [new Date(startDate).toISOString(), new Date(endDate).toISOString()] } });
      }
      let input = []
      if (searchValue) {
        input.push({
          "subjectName": {
            [Sequelize.Op.iLike]: `%${searchValue}%`
          }
        });
        input.push({
          "statusMessage": {
            [Sequelize.Op.iLike]: `%${searchValue}%`
          }
        });
        input.push(
          Sequelize.where(Sequelize.cast(Sequelize.col("statusCode"), 'varchar'), {
            [Sequelize.Op.iLike]: `%${searchValue}%`
          })
        );
        input.push({
          "requestID": {
            [Sequelize.Op.iLike]: `%${searchValue}%`
          }
        });
        condition.push({ [Op.or]: input });
      }
      requests = await Request.findAll({
        attributes: ["requestID", "subjectName", "createdAt", "statusCode", "statusMessage", "status"],
        where: { [Op.and]: condition },
        order: [[sortKey, sortValue]],
        "page": page,
        "limit": limit,
        "offset": offset,
      });
      logger.info(`Requests Count ::: ${requests.length}`)
      let totalCount = await Request.count({
        where: { [Op.and]: condition }
      });
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


const getRequestDetail = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Request Query ::: ${query}`);
      if (!query || !query.reqId) {
        logger.info(`Request ID is not defined or null`)
        return reject({
          message: "Request ID is undefined or null",
        });
      }
      let reqId = query.reqId;
      let requestDetail = [];
      logger.info(`Params ::: ${reqId}`)
      let requestStatus = await Request.findOne({
        where: { requestID: reqId }, attributes: ['requestID', 'veriflowID', 'subjectName',
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
        'status': 'status'
      }

      if (requestStatus && requestStatus.dataValues) {
        for (var key in requestStatus.dataValues) {
          requestDetail.push({ "key": keyMap[key], "value": requestStatus.dataValues[key], "checked": requestStatus.dataValues.status })
        }

        logger.info(`Response for requestId: ${reqId} ::: ${JSON.stringify(requestDetail)}`);

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
  return new Promise(async (resolve, reject) => {
    try {
      let response = {
        "avgReqPerDay": 0,
        "avgReqPerWeek": 0,
        "totalReq": 0,
        "totalReqWithSubjectFound": 0,
        "totalReqWithMismatch": 0,
        "avgReqPerDayvsLastWeek": 0,
        "avgReqPerWeekvsLastWeek": 0,
        "totalReqvsLastWeek": 0,
        "totalReqWithSubjectFoundvsLastWeek": 0,
        "totalReqWithMismatchvsLastWeek": 0
      };
      let countQuery = `
      SELECT 
      ROUND(((COUNT(*)::float)/(MAX("createdAt"::date) - min("createdAt"::date)))::decimal, 1)::float as "avgReqPerDay",
      ROUND(((COUNT(*)::float)/((EXTRACT('DAYS' from (DATE_TRUNC('week', max("createdAt"::date)) - DATE_TRUNC('week', min("createdAt"::date))))::integer)/7 + 1))::decimal, 1)::float as "avgReqPerWeek",
      COUNT(*)::integer as "totalReq",
      COUNT(CASE WHEN "status"=1 THEN "requestID" END)::integer as "totalReqWithSubjectFound",
      COUNT(CASE WHEN "status"=0 OR "status"=-1 THEN "requestID" END)::integer as "totalReqWithMismatch" 
      FROM hba.requests;`;

      let countQueryvsLastWeek = `
      SELECT 
      CASE 
        WHEN "prevWeekRequestCount" = 0 THEN '-' 
        ELSE trunc(round((("thisWeekRequestCount" - "prevWeekRequestCount")::decimal/"prevWeekRequestCount"), 2) * 100 )::text
        END as "avgVsLastWeekPerc",
      CASE 
        WHEN "prevWeekRequestCountWithSubjectFound" = 0 THEN '-' 
        ELSE trunc(round((("thisWeekRequestCountWithSubjectFound" - "prevWeekRequestCountWithSubjectFound")::decimal/"prevWeekRequestCountWithSubjectFound"), 2) * 100 )::text
        END as "totalReqWithSubjectFoundvsLastWeek",
      CASE 
        WHEN "prevWeekRequestCountWithMismatch" = 0 THEN '-' 
        ELSE trunc(round((("thisWeekRequestCountWithMismatch" - "prevWeekRequestCountWithMismatch")::decimal/"prevWeekRequestCountWithMismatch"), 2) * 100 )::text
        END as "totalReqWithMismatchvsLastWeek"
      FROM 
      (SELECT 
      COUNT(
        CASE WHEN "createdAt" BETWEEN 
        DATE_TRUNC('week', NOW()) - interval '7 day' 
        AND DATE_TRUNC('week', NOW()) 
        THEN "requestID" 
        END)::integer as "prevWeekRequestCount",
      COUNT(
        CASE WHEN "status"=1 AND "createdAt" BETWEEN 
        DATE_TRUNC('week', NOW()) - interval '7 day' 
        AND DATE_TRUNC('week', NOW()) 
        THEN "requestID" 
        END)::integer as "prevWeekRequestCountWithSubjectFound",
      COUNT(
        CASE WHEN ("status" IN (0,-1)) AND "createdAt" BETWEEN 
        DATE_TRUNC('week', NOW()) - interval '7 day' 
        AND DATE_TRUNC('week', NOW()) 
        THEN "requestID" 
        END)::integer as "prevWeekRequestCountWithMismatch",
      COUNT(
        CASE WHEN "createdAt" BETWEEN 
        DATE_TRUNC('week', NOW())
        AND DATE_TRUNC('week', NOW()) + interval '7 day' 
        THEN "requestID" 
        END)::integer as "thisWeekRequestCount",
      COUNT(
        CASE WHEN "status"=1 AND "createdAt" BETWEEN 
        DATE_TRUNC('week', NOW())
        AND DATE_TRUNC('week', NOW()) + interval '7 day' 
        THEN "requestID" 
        END)::integer as "thisWeekRequestCountWithSubjectFound",
      COUNT(
        CASE WHEN ("status" IN (0,-1)) AND "createdAt" BETWEEN 
        DATE_TRUNC('week', NOW())
        AND DATE_TRUNC('week', NOW()) + interval '7 day' 
        THEN "requestID" 
        END)::integer as "thisWeekRequestCountWithMismatch"
      FROM "hba"."requests") as foo`;

      let countRes = await dB.sequelize.query(countQuery, { type: QueryTypes.SELECT });
      let countResvsLastWeek = await dB.sequelize.query(countQueryvsLastWeek, { type: QueryTypes.SELECT });

      logger.info(`Count Query Data Result Length ::: ${countRes.length}`);
      logger.info(`Count Query Data vs Last Week Result Length ::: ${countResvsLastWeek.length}`);

      if (countRes && countRes.length > 0 && countRes[0]) {
        response.avgReqPerDay = countRes[0].avgReqPerDay;
        response.avgReqPerWeek = countRes[0].avgReqPerWeek;
        response.totalReq = countRes[0].totalReq;
        response.totalReqWithSubjectFound = countRes[0].totalReqWithSubjectFound;
        response.totalReqWithMismatch = countRes[0].totalReqWithMismatch;
      }

      if (countResvsLastWeek && countResvsLastWeek.length > 0 && countResvsLastWeek[0]) {
        response.avgReqPerDayvsLastWeek = countResvsLastWeek[0].avgVsLastWeekPerc;
        response.avgReqPerWeekvsLastWeek = countResvsLastWeek[0].avgVsLastWeekPerc;
        response.totalReqvsLastWeek = countResvsLastWeek[0].avgVsLastWeekPerc;
        response.totalReqWithSubjectFoundvsLastWeek = countResvsLastWeek[0].totalReqWithSubjectFoundvsLastWeek;
        response.totalReqWithMismatchvsLastWeek = countResvsLastWeek[0].totalReqWithMismatchvsLastWeek;
      }

      logger.info(`response ::: ${JSON.stringify(response)}`)
      return resolve(response);

    } catch (err) {
      return reject(err);
    }
  })
}

const viewPrevRequests = () => {
  return new Promise(async (resolve, reject) => {
    try {
      var datetime = new Date();
      let totalCount = await Request.count({
        where: { "createdAt": { [Op.gte]: datetime } }
      });
      return resolve(totalCount);
    } catch (err) {
      return reject(err);
    }
  })
}


module.exports = {
  verify,
  getAllRequests,
  getRequestDetail,
  getRequestCounts,
  viewPrevRequests
}
