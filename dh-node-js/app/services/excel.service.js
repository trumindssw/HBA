const fs = require('fs')
const path = require('path')
const fileSystem = require("fs");
const readXlsxFile = require("read-excel-file/node");
const moment = require('moment');
const xlsx = require('xlsx');

const dB = require('../models');
const { validateRowData, getMissingFields, validateHeaders } = require('../helpers/excel.helper');
const { log } = require('winston');
const Files = dB.files;
const Subject = dB.subjects;

const upload = (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (file == undefined) {
          return reject({ message: "Please upload a valid excel file (.xls, .xlsx)"});
        }
        let subjects = [];
        let errorList = [];
        let errorCount = 0;
        let isFileProcessed=true;
        // Save the data in db  

        const workbook = xlsx.read(file.buffer, { type: 'buffer' }); 
        
        // const sheets = workbook.SheetNames;
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1})
        const headers = sheetData.shift();
        if(!validateHeaders(headers)) {
          return reject({message: "Error - Headers mismatch Sample File Format. Please check and re-upload."})
        }
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) 
        console.log(':::', data);

        if(!data || (data && data.length==0)) {
          isFileProcessed = false;
          return reject({message: "Error - File is empty!"});
        }

        if(data && data.length > 0) {
          data.map((row, id) => {
            if(!validateRowData(row)) {
                isFileProcessed = false;
                if(errorCount >= 5) {
                  return reject({message: errorList})
                }
                errorCount+=1;
                let fields = getMissingFields(row);
                let text = ``;
                if(fields && fields.length > 0) {
                  text = fields.join(", ")
                }
                errorList.push(`Error - Row ${id+1} : (S.No ${row['S.No']}) ${text} ${fields.length==1 ? 'is' : 'are'} missing. Please check and re-upload.`)   
            }
            
            if(errorCount == 0 && isFileProcessed) {
              let subj = {
                regNumber: row.regNumber,
                firstName: row.firstName,
                middleName:row.middleName,
                lastName: row.lastName,
                issuingAuthority: row.issuingAuthority,
                department: row.department,
                document: row.document,
                startDate: row.startDate,
                endDate: row.endDate,
              };
              subjects.push(subj);
            }
          });
        }
          
        
        console.log("Count: " + errorCount)
        if(errorCount == 0 && isFileProcessed) {
          console.log("Ï am In")
          Subject.bulkCreate(
            subjects, 
            {updateOnDuplicate: ['firstName', 'middleName', 'lastName', 'department', 'startDate', 'endDate']})
            .then(() => {
                // Insert file into db
                let filename = file && file.originalname && `${Date.now()}-${file.originalname}`
                Files.create(
                    {
                    fileName: filename,
                    data: file.buffer
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
        } else {
          console.log("@#$% Final : ", errorList , errorCount)
          return reject({message: errorList})
        }
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
            let files = await Files.findAll({
              order: [['createdAt', 'DESC']]
            });
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
                return res.status(200).send(data)
            } else {
                let fl = await Files.findOne({ where : { fileName: params.fileName }})
                console.log(fl)
                if(fl && fl!=null) {
                    console.log("Result=====> ", fl.id);
                    res.status(200).send({
                        data: fl.data
                    });
                }
            }    
        } catch (err) {
            console.log(err);
            return reject(err);
        }
    })
}

module.exports = {
    upload,
    getUploadedFiles,
    downloadTemplate
}