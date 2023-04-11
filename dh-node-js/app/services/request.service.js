const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const dB = require('../models');
const { getNextChar } = require("../helpers/util.helper");
const Subject = dB.subjects;
const Request = dB.requests;

const verify = (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      const reqId = await getRequestID();
      console.log(reqId);
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

const getRequestID = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let veriflowId = process.env.VERIFLOW_ID;
      let requestId = '';
      const request = await Request.findOne({
        order: [['requestID', 'DESC']]
      })
      if(!request) {
        requestId = requestId + veriflowId + 'AA0001';
      } else {
        requestId = request.requestID;
        // requestId = 'IA1576BZ9999'
        let strLength = requestId && requestId.length;
        let digits = parseInt(requestId.slice(strLength - 4));
        let chars = requestId.slice(strLength-6, strLength-4);
        console.log(digits, chars);
        if(digits && digits<9999) {
          digits+=1;
        } else {
          digits='0001';
          let ch1='';
          let ch2='';
          if(chars && chars[1]<'Z' && chars[1]>='A') {
            ch1 = chars[0];
            ch2 = getNextChar(chars[1]);
          } else if(chars && chars[1]=='Z') {
            ch2 = 'A';
            ch1 = getNextChar(chars[0]);
          }

          if(ch1>='A' && ch1<='Z' && ch2>='A' && ch2<='Z') {
            chars = ch1+ch2;
          } else {
            return reject("RequestID limit reached!")
          }
        }
        requestId = veriflowId + chars + digits;
      }
      resolve(requestId);

    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  verify,
}
