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

router.post('/login', responseMiddleWare(), (req, res) => {
    LoginServices.login(req.body)
      .then((data) => {
        sendResponse(res, 'Login Successful', data);
    })
    .catch((err) => {
        sendResponse(res, err.message, null, err);
    });
});

module.exports = router;