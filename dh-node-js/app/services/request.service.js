const moment = require('moment');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const fs = require('fs')
const path = require('path')
const fileSystem = require("fs");
//const readXlsxFile = require("read-excel-file/node");

const dB = require('../models');
//const { validateRowData } = require('../helpers/excel.helper');
// const Files = dB.files;
const Subject = dB.subjects;
const Request = dB.request;

const verify = (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { firstName, lastName, issuingAuthority, document, startDate, endDate } = body;
      // console.log(moment(startDate).format("YYYY-MM-DD"))
      // console.log(moment(endDate).format("YYYY-MM-DD"))
      const found = await Subject.findOne({
        where: {
          [Op.and]:
            [{ firstName: firstName }, { lastName: lastName }, { universityName: issuingAuthority },
            Sequelize.where(Sequelize.fn('date', Sequelize.col('startDate')), '=', startDate),
            { degreeName: document }, 
            Sequelize.where(Sequelize.fn('date', Sequelize.col('endDate')), '=', endDate)]
        }
      })
      //console.log(found.toJSON())
      if (found != null) {
        return resolve({
          message: "Subject is verified... "
        });
      }
      else {
        return reject({
          message: "Not Verified... ",
        });

      }

    } catch (error) {
      console.log(error);
      return reject({
        message: "Could not verify the subject... ",
      });
    }
  })
}

module.exports = {
  verify,
}
