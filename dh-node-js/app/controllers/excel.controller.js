/***
 *
 * Controller class for excel uploads.
 * @file excel.controller.js
 * @description Excel controller
 */

const modl = "excel";

var { swagger } = require('../config/swagger/swagger.config');
const dB = require('../models');
const Files = dB.files;
const Subject = dB.subjects;
const path = require("path");
const fs = require('fs')
const fileSystem = require("fs");
const readXlsxFile = require("read-excel-file/node");

const upload = async (req, res) => {
    try {
        if (req.file == undefined) {
          return res.status(400).send("Please upload an excel file!");
        }
    
        let path =
          __basedir + "/app/datafiles/uploads/" + req.file.filename;
    
        // Insert file into db
        Files.create(
          {
            fileName: req.file.filename,
            data: Buffer.from(fs.readFileSync(path))
          }
        )
    
        console.log(__basedir)
    
        // Save the data in db
    
        readXlsxFile(path).then((rows) => {
          // skip header
          rows.shift();
    
          let subjects = [];
    
          rows.forEach((row) => {
            let subj = {
              registrationNumber: row[0],
              firstName: row[1],
              lastName: row[2],
              universityID: row[3],
              universityName: row[4],
              degreeName: row[5],
              yearOfPassing: row[6],
              startDate: row[7],
              endDate: row[8],
            };
    
            subjects.push(subj);
          });
          console.log(subjects)
    
          Subject.bulkCreate(subjects)
            .then(() => {
              res.status(200).send({
                message: "Uploaded the file successfully: " + req.file.originalname,
              });
            })
            .catch((error) => {
              res.status(500).send({
                message: "Fail to import data into database!",
                error: error.message,
              });
            });
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          message: "Could not upload the file: " + req.file.originalname,
        });
      }
}

const getTutorials = async (req, res) => {
    Subject.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
}

const downloadTemplate = async (req, res) => {
    try {
        if(req.query.template && req.query.template=='true') {
          var file = req.params.fileName + ".xlsx";
          var fileLocation = path.join(__basedir, "/app/datafiles/templates/", file);
          var stat = fileSystem.statSync(fileLocation);
          console.log(fileLocation);
          res.writeHead(200, {
            "Content-disposition": `attachment; filename=${file}`,
            "Content-Type": "file",
            "Content-Length": stat.size,
          });
          var readStream = fileSystem.createReadStream(fileLocation);
          readStream.pipe(res);
        } else {
          console.log("++++++++++++I am in")
          Files.findOne({where : {
            fileName: req.params.fileName + ".xlsx"
          }}).then(rec => {
            console.log("Result=====> ", rec.id);
            res.status(200).send({
              status: 1,
              message: "File downloaded: " + rec.fileName,
              data: rec.data
            });
          })
        }
        
      } catch (err) {
        console.log(err);
        res.status(200).send({
          status: 0,
          message: "Could not upload the file: " + req.params.fileName,
          error: err
        });
      //   sendResponse(res, err.message, null, err);
      }
}


module.exports = {
    upload,
    getTutorials,
    downloadTemplate
};