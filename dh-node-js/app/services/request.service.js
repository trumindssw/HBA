const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const dB = require('../models');
const { getNextChar } = require("../helpers/util.helper");
const Subject = dB.subjects;
const Request = dB.requests;

const verify = (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      var status;
      var statusMessage;
      var request = [];
      arr = JSON.parse(JSON.stringify(body));

      var reqId = await getRequestIDFromDB();
      for (let ind = 0; ind < arr.length; ind++) {
        let index = arr[ind];
        // console.log('*************');
        // console.log(reqId);

        var firstName = index.firstName;
        var lastName = index.lastName;
        var issuingAuthority = index.issuingAuthority;
        var document = index.document;
        var startDate = index.startDate;
        var endDate = index.endDate;

        // console.log(firstName);

        const found = await Subject.findOne({
          where: {
            [Op.and]:
              [{ firstName: firstName }, { lastName: lastName }, { issuingAuthority: issuingAuthority },
              Sequelize.where(Sequelize.fn('date', Sequelize.col('startDate')), '=', startDate),
              { document: document },
              Sequelize.where(Sequelize.fn('date', Sequelize.col('endDate')), '=', endDate)]
          }
        })
        // console.log("HIIIIIIIIIIIIII")
        // console.log(found);
        if (found != null) {
          status = 1;
          statusMessage = "Verified";

        } else {
          status = 0;
          statusMessage = "Not Verified";
        }
        // console.log('@@@@@@@@@@@@@@@@@@@@');
        // console.log(status)
        let req = {
          requestID: reqId,
          subjectName: firstName,
          status: status,
          statusMessage: statusMessage,

        };
        request.push(req);
        // console.log("-------------------------")
        // console.log(req);
        reqId = await getNextRequestID(reqId);
        // console.log('############');
        // console.log(reqId);
      }
      // console.log('$$$$$$$$$$$$$$$$$$$$$$')
      // console.log(request);
      Request.bulkCreate(request).then(() => {
        return resolve({
          message: "Inserted the request..",
          data: request,
        });
      })
    } catch (error) {
      console.log(error);
      return reject({
        message: "Could not verify the subject... ",
      });
    }
  })
}


// Return the next request id 
const getNextRequestID = (reqId) => {

  try {
    let veriflowId = process.env.VERIFLOW_ID;
    let strLength = reqId && reqId.length;
    let digits = parseInt(reqId.slice(strLength - 4));
    let chars = reqId.slice(strLength - 6, strLength - 4);
    console.log(digits, chars);
    if (digits && digits < 9999) {
      digits += 1;
    } else {
      digits = '0001';
      let ch1 = '';
      let ch2 = '';
      if (chars && chars[1] < 'Z' && chars[1] >= 'A') {
        ch1 = chars[0];
        ch2 = getNextChar(chars[1]);
      } else if (chars && chars[1] == 'Z') {
        ch2 = 'A';
        ch1 = getNextChar(chars[0]);
      }
      if (ch1 >= 'A' && ch1 <= 'Z' && ch2 >= 'A' && ch2 <= 'Z') {
        chars = ch1 + ch2;
      } else {
        return reject("RequestID limit reached!")
      }
    }
    digits = "0".repeat(4 - digits.toString().length) + digits;
    reqId = veriflowId + chars + digits;
    return reqId;
  } catch (err) {
    console.log(err);
  }
}


//Return the reqId from the database which is the latest

const getRequestIDFromDB = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let veriflowId = process.env.VERIFLOW_ID;
      let requestId = '';
      const request = await Request.findOne({
        order: [['requestID', 'DESC']]
      })
      if (!request) {
        requestId = requestId + veriflowId + 'AA0001';
      } else {
        requestId = request.requestID;
        // requestId = 'DU100AA0016'
        requestId = getNextRequestID(requestId)
      }
      resolve(requestId);

    } catch (err) {
      reject(err)
    }
  })
}



// const getRequestID = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let veriflowId = process.env.VERIFLOW_ID;
//       let requestId = '';
//       const request = await Request.findOne({
//         order: [['requestID', 'DESC']]
//       })
//       console.log("-----------")
//       console.log(request);
//       if (!request) {
//         requestId = requestId + veriflowId + 'AA0001';
//       } else {
//         requestId = request.requestID;
//         // requestId = 'IA1576BZ9999'
//         let strLength = requestId && requestId.length;
//         let digits = parseInt(requestId.slice(strLength - 4));
//         let chars = requestId.slice(strLength - 6, strLength - 4);
//         console.log(digits, chars);
//         if (digits && digits < 9999) {
//           digits += 1;
//         } else {
//           digits = '0001';
//           let ch1 = '';
//           let ch2 = '';
//           if (chars && chars[1] < 'Z' && chars[1] >= 'A') {
//             ch1 = chars[0];
//             ch2 = getNextChar(chars[1]);
//           } else if (chars && chars[1] == 'Z') {
//             ch2 = 'A';
//             ch1 = getNextChar(chars[0]);
//           }

//           if (ch1 >= 'A' && ch1 <= 'Z' && ch2 >= 'A' && ch2 <= 'Z') {
//             chars = ch1 + ch2;
//           } else {
//             return reject("RequestID limit reached!")
//           }
//         }
//         digits = "0".repeat(4 - digits.toString().length) + digits;
//         requestId = veriflowId + chars + digits;
//       }
//       resolve(requestId);

//     } catch (err) {
//       reject(err)
//     }
//   })
// }

const getAllRequests = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let requests = await Request.findAll();
      //console.log(requests);
      if(requests){
        return resolve({
          message: "Previous Requests are...",
          data: requests,
        });
      }else{
        return reject({
          message: "there are no previous requests...",
        });
      }
    } catch (error) {
      console.log(error);
      return reject({
        message: "Could not get the requests ",
      });
    }
  })
}

module.exports = {
  verify,
  getAllRequests,
}
