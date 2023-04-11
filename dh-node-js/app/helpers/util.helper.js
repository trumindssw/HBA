const deepCopy = (data) => {
    return JSON.parse(JSON.stringify(data));
}

const isEmptyObject = (obj) => {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
};

//sending api response with 200 status code with some msg, status, and data or error
const sendResponse = (res, msg, data, error = null) => {
  console.log("1234567 ", msg, data, error)
    if (error) {
      res.status(200).json({ status: 0, message: msg, error });
    } else {
      res.status(200).json({ status: 1, message: msg, data });
    }
  };

const getNextChar = (char) => {
  return String.fromCharCode(char.charCodeAt(0) + 1);
}

  
module.exports = {
    deepCopy,
    isEmptyObject,
    sendResponse,
    getNextChar
}
