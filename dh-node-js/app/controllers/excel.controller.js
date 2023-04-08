/***
 *
 * Controller class for excel uploads.
 * @file excel.controller.js
 * @description Excel controller
 */

const express = require('express');
var router = express.Router();

var { swagger } = require('../config/swagger/swagger.config');
const ExcelServices = require('../services/excel.service')
const uploadFile = require('../middlewares/upload');
const responseMiddleWare = require("../middlewares/responseHandler");
const { sendResponse } = require('../helpers/util.helper');

router.post('/upload', uploadFile.single('file'), responseMiddleWare(), (req, res) => {
  ExcelServices.upload(req.file)
    .then((files) => {
      sendResponse(res, 'File Uploaded', files);
    })
    .catch((err) => {
      sendResponse(res, err.message, null, err);
    });
});

router.get('/getUploadedFiles', responseMiddleWare(), (req, res) => {
  ExcelServices.getUploadedFiles()
    .then((files) => {
      sendResponse(res, 'List of Files Uploaded', files);
    })
    .catch((err) => {
      sendResponse(res, err.message, err);
    });
});

router.post('/download/:fileName', responseMiddleWare(), (req, res) => {
  ExcelServices.downloadTemplate(req.query, req.params, res)
    .then((files) => {
      sendResponse(res, 'Template downloaded', files);
    })
    .catch((err) => {
      sendResponse(res, err.message, null, err);
    });
});

module.exports = router;