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

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/app/datafiles/uploads/");
  },
  filename: (req, file, cb) => {
    console.log("QWERTYUIOP ", file)
    if(file && file!=undefined) {
      console.log(file.originalname);
      cb(null, `${Date.now()}-${file.originalname}`);
    } else {
      cb("-----No file selected! Please upload a excel file.", false);
    }
    
  },
});

var uploadFile = multer();
module.exports = uploadFile;