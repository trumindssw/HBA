const fs = require('fs')
const path = require('path')
const fileSystem = require("fs");
const readXlsxFile = require("read-excel-file/node");

const dB = require('../models');
const { validateRowData } = require('../helpers/excel.helper');
const Files = dB.files;
const Subject = dB.subjects;

const upload = (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (file == undefined) {
          return reject({ message: "No file selected! Please upload a excel file."});
        }
        let path = __basedir + "/app/datafiles/uploads/" + file.filename;
        // Save the data in db  
        readXlsxFile(path).then((rows) => {
          // skip header
          rows.shift();
          if(rows && rows.length == 0) {
            return reject({message: "File is empty!"});
          }
          let subjects = [];
          rows.forEach((row, id) => {
            if(!validateRowData(row)) {
                return reject({message: `Row ${id+1} : One of these mandatory fields missing (Registration Number, First Name, University ID, Degree, Year Of Passing)`})
            }
            let subj = {
              registrationNumber: row[1],
              firstName: row[2],
              lastName: row[3],
              universityID: row[4],
              universityName: row[5],
              degreeName: row[6],
              yearOfPassing: row[7],
              startDate: row[8],
              endDate: row[9],
            };
            subjects.push(subj);
          });
    
          Subject.bulkCreate(subjects)
            .then(() => {
                // Insert file into db
                Files.create(
                    {
                    fileName: file.filename,
                    data: Buffer.from(fs.readFileSync(path))
                    }
                );
                return resolve({
                    message: "Uploaded the file successfully: " + file.originalname,
                });
            })
            .catch((error) => {
              return reject({
                message: "Fail to import data into database!",
                error: error.message,
              });
            });
        });
      } catch (error) {
        console.log(error);
        return reject({
          message: "Could not upload the file: " + file.originalname,
        });
      }
    })      
}

const getUploadedFiles = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let files = await Files.findAll();
            let data = [];

            files.map((fl) => {
                let obj = {};
                obj.id = fl.id;
                obj.fileName = fl.fileName;
                obj.createdAt = fl.createdAt;

                data.push(obj);
            })

            resolve(data)
        } catch(err) {
            reject({message: err.message || "Some error occurred while retrieving files."});
        }
    })
}

const downloadTemplate = (query, params, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(query && query.template && query.template=='true') {
                var file = params && params.fileName + ".xlsx";
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
                resolve(data)
            } else {
                Files.findOne({ where : { fileName: params.fileName + ".xlsx" }})
                .then(rec => {
                    console.log("Result=====> ", rec.id);
                    resolve({
                        data: rec.data
                    });
                })
            }    
        } catch (err) {
            console.log(err);
            reject(err);
        }
    })
}

module.exports = {
    upload,
    getUploadedFiles,
    downloadTemplate
}