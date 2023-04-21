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

router.post('/verify', verifyToken, responseMiddleWare(), (req, res) => {
    RequestServices.verify(req.body)
      .then((data) => {
        sendResponse(res, 'Processed request', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

router.get('/getAllRequests', verifyToken, responseMiddleWare(), (req, res) => {
    RequestServices.getAllRequests({...req.query})
      .then((data) => {
        sendResponse(res, 'All the requests', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

router.get('/getRequestDetail/:reqId', verifyToken, responseMiddleWare(), (req, res) => {
    RequestServices.getRequestDetail(req.params)
      .then((data) => {
        sendResponse(res, 'Detail of the request', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

router.get('/getRequestCounts', verifyToken, responseMiddleWare(), (req, res) => {
    RequestServices.getRequestCounts()
    .then((data) => {
        sendResponse(res, 'Request Counts', data);
    })
    .catch(err => {
        sendResponse(res, err.message, null, err);
    })
})
module.exports = router;