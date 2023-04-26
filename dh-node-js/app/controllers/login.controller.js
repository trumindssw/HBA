/***
 *
 * Controller class for login.
 * @file login.controller.js
 * @description Login controller
 */

const express = require('express');
var router = express.Router();

const responseMiddleWare = require("../middlewares/responseHandler");
const { sendResponse } = require('../helpers/util.helper');
const LoginServices = require('../services/login.service');
const { logger } = require('../config/logger/logger');

router.post('/login', responseMiddleWare(), (req, res) => {
    logger.info(`Request: ${req.method} ${req.originalUrl}`)
    logger.info(`Request Body: ${JSON.stringify(req.body)}`)
    LoginServices.login(req.body)
      .then((data) => {
        sendResponse(res, 'Login Successful', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

module.exports = router;