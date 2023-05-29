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
      sendResponse(res, 'Uploaded Successfully !!', files);
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
      sendResponse(res, err.message, null, err);
    });
});

// const getUploadedFilesController =  (req, res) => {
//   logger.info(`Request: ${req.method} ${req.originalUrl}`)
//   ExcelServices.getUploadedFiles()
//     .then((files) => {
//       sendResponse(res, 'List of Files Uploaded', files);
//     })
//     .catch((err) => {
//       sendResponse(res, err.message, null, err);
//     });
// };

router.get('/download', verifyToken, (req, res) => {
  logger.info(`Request: ${req.method} ${req.originalUrl}`)
  try {
    let fileName = req && req.query && req.query.fileName;
    logger.info(`Request Query: ${JSON.stringify(fileName)}`)
    if (fileName) {
      Files.findOne({ where: { fileName: fileName } })
        .then(fl => {
          logger.info(`File Id: ${fl.id}`);
          res.setHeader(
            "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition", `attachment; filename=${fileName}`);
          res.status(200).send(fl.data);
        })
        .catch(error => {
          logger.error(`Error in getting the file ::: ${error}`);
          res.status(400).send({ message: `No such file with filename: ${fileName}` })
        })
    } else {
      logger.error(`Error in query params`);
      res.status(400).send({ message: `Please provide a fileName` })
    }

  } catch (err) {
    console.log(err);
    res.send(400).send(err)
  }
});

module.exports = router;