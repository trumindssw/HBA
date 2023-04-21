const multer = require("multer");

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    //req.fileValidationError = "Please upload only excel file (.xlsx, .xls) ";
    cb(null, false);
  }
};

var uploadFile = multer({fileFilter: excelFilter});
module.exports = uploadFile;