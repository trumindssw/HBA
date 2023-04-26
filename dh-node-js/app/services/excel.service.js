const fs = require('fs')
const path = require('path')
const fileSystem = require("fs");
const xlsx = require('xlsx');

const dB = require('../models');
const { validateRowData, getMissingFields, validateHeaders, isValidDate } = require('../helpers/excel.helper');
const { logger } = require('../config/logger/logger');
const Files = dB.files;
const Subject = dB.subjects;

const upload = (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (file == undefined) {
          logger.warn('Please upload a valid excel file (.xls, .xlsx)')
          return reject({ message: "Please upload a valid excel file (.xls, .xlsx)"});
        }
        logger.info(`File to upload ::: ${file.originalname}`)
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
          logger.error('Headers mismatch Sample File Format')
          return reject({message: "Error - Headers mismatch Sample File Format. Please check and re-upload."})
        }
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {raw: false}) 
        logger.info('Total Data Length :::' + data.length)

        if(!data || (data && data.length==0)) {
          isFileProcessed = false;
          logger.error('File is empty')
          return reject({message: "Error - File is empty!"});
        }

        if(data && data.length > 0) {
          data.map((row, id) => {
            if(!validateRowData(row)) {
                isFileProcessed = false;
                if(errorCount >= 5) {
                  logger.error(`Error List ::: ${JSON.stringify(errorList)}`)
                  return reject({message: errorList})
                }
                errorCount+=1;
                let fields = getMissingFields(row);
                let text = ``;
                if(fields && fields.length > 0) {
                  text = fields.join(", ")
                }
                logger.info(`Row ${id+1}: Missing Fields ::: ${text}`)
                let isDateValid = isValidDate(row.startDate, row.endDate);
                if(text) {
                  errorList.push(`Error - Row ${id+1} : ${text} ${fields.length==1 ? 'is' : 'are'} missing. Please check and re-upload.`)
                } else {
                  if(!isDateValid) {
                    logger.info(`Row ${id+1}: Invalid startDate /  endDate format`)
                    errorList.push(`Error - Row ${id+1} : Start Date / End Date format is not of type date (MM/DD/YYYY). Please check and re-upload.`)
                  } else {
                    logger.info(`Row ${id+1}: startDate > endDate`)
                    errorList.push(`Error - Row ${id+1} : Start Date greater than End Date. Please check and re-upload.`)
                  }
                }
                   
            }
            
            if(errorCount == 0 && isFileProcessed) {
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
        
        logger.info(`Error Count ::: ${errorCount}`)
        logger.info(`Subjects Data Length ::: ${subjects.length}`)

        if(errorCount == 0 && isFileProcessed) {
          Subject.bulkCreate(
            subjects, 
            {updateOnDuplicate: ['firstName', 'middleName', 'lastName', 'department', 'startDate', 'endDate', 'updatedAt']})
            .then(() => {
                logger.info('Subject Data inserted into DB successfully.')
                // Insert file into db
                let filename = file && file.originalname && `${Date.now()}-${file.originalname}`
                Files.create({
                    fileName: filename,
                    data: file.buffer
                  }
                );
                logger.info(`File ${filename} inserted into DB successfully.`)
                return resolve({
                    message: "Uploaded the file successfully: " + file.originalname,
                });
            })
            .catch((error) => {
              logger.error(`Fail to import data ::: ${error.message}`)
              return reject({
                message: "Fail to import data into database!",
                error: error.message
              });
            });
        } else {
          logger.error(`Error List Data (< 5) ::: ${JSON.stringify(errorList)}`)
          return reject({message: errorList})
        }
      } catch (error) {
        logger.error(`Could not upload file ::: ${JSON.stringify(error)}`);
        return reject({
          message: "Could not upload the file: " + file.originalname
        });
      }
    })      
}

const getUploadedFiles = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let files = [];
            files = await Files.findAll({
              order: [['createdAt', 'DESC']],
              attributes: ['fileName', 'createdAt']
            });

            if(files && files.length > 0 ) {
              logger.info(`Uploaded Files Length ::: ${files.length}`)
              resolve(files)
            } else {
              logger.info(`Uploaded Files Length ::: 0`)
              resolve([]);
            }
        } catch(err) {
          logger.info(`Error to fetch uploaded files list ::: ${err.message}`)
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