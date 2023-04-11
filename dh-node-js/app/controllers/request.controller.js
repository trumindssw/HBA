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

router.post('/verify', responseMiddleWare(), (req, res) => {
    RequestServices.verify(req.body)
      .then((data) => {
        sendResponse(res, 'Verified', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

module.exports = router;