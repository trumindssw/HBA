/***
 *
 * Controller class for requests.
 * @file requests.controller.js
 * @description Requests controller
 */

const express = require('express');
var router = express.Router();

const responseMiddleWare = require("../middlewares/responseHandler");
const { sendResponse } = require('../helpers/util.helper');
const RequestServices = require('../services/request.service');
const verifyToken = require('../middlewares/auth');
const { logger } = require('../config/logger/logger');

router.post('/verify', verifyToken, responseMiddleWare(), (req, res) => {
    logger.info(`Request: ${req.method} ${req.originalUrl}`)
    RequestServices.verify(req.body)
      .then((data) => {
        sendResponse(res, 'Processed request', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

router.post('/getAllRequests', verifyToken, responseMiddleWare(), (req, res) => {
    logger.info(`Request: ${req.method} ${req.originalUrl}`)
    RequestServices.getAllRequests(req.body)
      .then((data) => {
        sendResponse(res, 'All the requests', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

router.get('/getRequestDetail', verifyToken, responseMiddleWare(), (req, res) => {
    logger.info(`Request: ${req.method} ${req.originalUrl}`)
    RequestServices.getRequestDetail(req.query)
      .then((data) => {
        sendResponse(res, 'Detail of the request', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

router.get('/getRequestCounts', verifyToken, responseMiddleWare(), (req, res) => {
    logger.info(`Request: ${req.method} ${req.originalUrl}`)
    RequestServices.getRequestCounts()
    .then((data) => {
        sendResponse(res, 'Request Counts', data);
    })
    .catch(err => {
        sendResponse(res, err.message, null, err);
    })
})

router.get('/viewPrevRequests', verifyToken, responseMiddleWare(), (req, res) => {
    logger.info(`Request: ${req.method} ${req.originalUrl}`)
    RequestServices.viewPrevRequests()
    .then((data) => {
        sendResponse(res, 'Previous Request Count', data);
    })
    .catch(err => {
        sendResponse(res, err.message, null, err);
    })
})

// router.get('/currentTime', verifyToken, responseMiddleWare(), (req, res) => {
//     logger.info(`Request: ${req.method} ${req.originalUrl}`)
//     RequestServices.currentTime()
//     .then((data) => {
//         sendResponse(res, 'currentTime', data);
//     })
//     .catch(err => {
//         sendResponse(res, err.message, null, err);
//     })
// })
module.exports = router;