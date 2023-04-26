/***
 *
 * Controller class for excel uploads.
 * @file excel.controller.js
 * @description Excel controller
 */

const express = require('express');
const path = require('path');
const fileSystem = require('fs')
var router = express.Router();

var { swagger } = require('../config/swagger/swagger.config');
const ExcelServices = require('../services/excel.service')
const uploadFile = require('../middlewares/upload');
const responseMiddleWare = require("../middlewares/responseHandler");
const { sendResponse } = require('../helpers/util.helper');
const verifyToken = require('../middlewares/auth');
const dB = require('../models');
const { logger } = require('../config/logger/logger');
const Files = dB.files;

router.post('/upload', verifyToken, uploadFile.single('file'), responseMiddleWare(), (req, res) => {
  logger.info(`Request: ${req.method} ${req.originalUrl}`)
  ExcelServices.upload(req.file)
    .then((files) => {
      sendResponse(res, 'File Uploaded !', files);
    })
    .catch((err) => {
      sendResponse(res, err.message, null, err);
    });
});

router.get('/getUploadedFiles', verifyToken, responseMiddleWare(), (req, res) => {
  logger.info(`Request: ${req.method} ${req.originalUrl}`)
  ExcelServices.getUploadedFiles()
    .then((files) => {
      sendResponse(res, 'List of Files Uploaded', files);
    })
    .catch((err) => {
      sendResponse(res, err.message, err);
    });
});

router.get('/download/:fileName', verifyToken, (req, res) => {
  logger.info(`Request: ${req.method} ${req.originalUrl}`)
  try {
      let query = req && req.query;
      let params = req && req.params;
      logger.info(`Request Query: ${JSON.stringify(query)}`)
      logger.info(`Request Params: ${JSON.stringify(params)}`)
      if(query && query.template && query.template=='true') {
          var file = params && params.fileName;
          var fileLocation = path.join(__basedir, "/app/datafiles/templates/", file);
          var stat = fileSystem.statSync(fileLocation);
          logger.info(`File location: ${fileLocation}`);
          var readStream = fileSystem.createReadStream(fileLocation);
          
          res.setHeader(
            "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition", `attachment; filename=${file}`);
          readStream.pipe(res);
      } else {
          Files.findOne({ where : { fileName: params.fileName }})
          .then (fl => {
            logger.info(`File Id: ${fl.id}`);
            res.setHeader(
              "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "Content-Disposition", `attachment; filename=${params.fileName}`);
              res.status(200).send(fl.data);
          })
      }    
  } catch (err) {
      console.log(err);
      // sendResponse(res, err.message, null, err);
  }
});

module.exports = router;