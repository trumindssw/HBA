const fs = require('fs')
const path = require('path')
const fileSystem = require("fs");
const readXlsxFile = require("read-excel-file/node");
const moment = require('moment');
const xlsx = require('xlsx');
const { QueryTypes } = require('sequelize');

const dB = require('../models');
const { validateRowData, getMissingFields, validateHeaders, validateRowDataWithSNo, isValidDate } = require('../helpers/excel.helper');
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
        const keySubjectMap = new Map()
        // Save the data in db  

        const workbook = xlsx.read(file.buffer, { type: 'buffer' }); 
        
        // const sheets = workbook.SheetNames;
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1})
        const headers = sheetData.shift();
        if(!validateHeaders(headers)) {
          return reject({message: "Error - Headers mismatch Sample File Format. Please check and re-upload."})
        }
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {raw: false}) 
        console.log(':::', data);

        if(!data || (data && data.length==0)) {
          isFileProcessed = false;
          return reject({message: "Error - File is empty!"});
        }

        if(data && data.length > 0) {
          data.map((row, id) => {
            let isRowProcessed = false;
            if(validateRowDataWithSNo(row)) {
              console.log("I came in ")
              isRowProcessed = true;
            }
            if(!isRowProcessed && !validateRowData(row)) {
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

                let isDateValid = isValidDate(row.startDate, row.endDate);
                console.log("@@@ ", isDateValid)
                if(text) {
                  errorList.push(`Error - Row ${id+1} : ${text} ${fields.length==1 ? 'is' : 'are'} missing. Please check and re-upload.`)
                } else {
                  if(!isDateValid) {
                    errorList.push(`Error - Row ${id+1} : Start Date / End Date format is not of type date (MM/DD/YYYY). Please check and re-upload.`)
                  } else {
                    errorList.push(`Error - Row ${id+1} : Start Date greater than End Date. Please check and re-upload.`)
                  }
                }
                   
            }
            
            if(errorCount == 0 && isFileProcessed && !isRowProcessed) {
              console.log("Index is $$$$$: ", id, keySubjectMap)
              let keyArr = JSON.stringify([row.regNumber, row.issuingAuthority, row.document]);
              if(keySubjectMap.has(keyArr)) {
                let ind = keySubjectMap.get(keyArr);
                subjects[ind] = row;
              } else {
                keySubjectMap.set(keyArr, subjects.length);
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
              
            }
          });
        } 
        
        console.log("Count: " + errorCount)
        console.log("Subjects: ")
        subjects.map(s=>{
          console.log(s)
        })
        if(errorCount == 0 && isFileProcessed) {
          console.log("Ï am In")
          Subject.bulkCreate(
            subjects, 
            {updateOnDuplicate: ['firstName', 'middleName', 'lastName', 'department', 'startDate', 'endDate', 'updatedAt']})
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
                error: error.message
              });
            });
        } else {
          console.log("@#$% Final : ", errorList , errorCount)
          return reject({message: errorList})
        }
      } catch (error) {
        console.log(error);
        return reject({
          message: "Could not upload the file: " + file.originalname
        });
      }
    })      
}

const getUploadedFiles = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let files = await Files.findAll({
              order: [['createdAt', 'DESC']],
              attributes: ['fileName', 'createdAt']
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