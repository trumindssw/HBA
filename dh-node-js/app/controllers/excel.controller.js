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
const verifyToken = require('../middlewares/auth');
const dB = require('../models');
const Files = dB.files;

router.post('/upload', verifyToken, uploadFile.single('file'), responseMiddleWare(), (req, res) => {
  console.log("!@#$%^#$%^T ", req.file)
  ExcelServices.upload(req.file)
    .then((files) => {
      sendResponse(res, 'File Uploaded', files);
    })
    .catch((err) => {
      sendResponse(res, err.message, null, err);
    });
});

router.get('/getUploadedFiles', verifyToken, responseMiddleWare(), (req, res) => {
  ExcelServices.getUploadedFiles()
    .then((files) => {
      sendResponse(res, 'List of Files Uploaded', files);
    })
    .catch((err) => {
      sendResponse(res, err.message, err);
    });
});

router.get('/download/:fileName', verifyToken, (req, res) => {
  try {
      let query = req && req.query;
      let params = req && req.params;
      console.log(query)
      if(query && query.template && query.template=='true') {
          var file = params && params.fileName;
          var fileLocation = path.join(__basedir, "/app/datafiles/templates/", file);
          var stat = fileSystem.statSync(fileLocation);
          console.log(fileLocation);
          let data = Buffer.from(fs.readFileSync(fileLocation))
          // res.writeHead(200, {
          //     "Content-disposition": `attachment; filename=${file}`,
          //     "Content-Type": "file",
          //     "Content-Length": stat.size,
          // });
          // var readStream = fileSystem.createReadStream(fileLocation);
          // readStream.pipe(res);
          res.setHeader(
            "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition", `attachment; filename=${file}`);
          return res.status(200).send(data)
      } else {
          Files.findOne({ where : { fileName: params.fileName }})
          .then (fl => {
            console.log("Result=====> ", fl.id);
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