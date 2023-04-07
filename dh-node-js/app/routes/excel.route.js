
const ctrl = "excel";

const controller = require(`../controllers/${ctrl}.controller`);
const path = `/${ctrl}`;

// response handler middleware
const responseMiddleWare = require("../middlewares/responseHandler");

// validations middleware
const { validator } = require("../middlewares/validations");
const { joiSchemas } = require('../middlewares/schemas');
const schema = joiSchemas[ctrl];
const upload = require("../middlewares/upload");

module.exports = (basePath, router) => {
    console.log(`Excel ${basePath} ----- ${path} routes`);
    router.post(basePath + path + '/upload', upload.single('file'), responseMiddleWare(), controller.upload);  //Register new user
    router.get(basePath + path + '/tutorials', responseMiddleWare(), controller. getTutorials);           //Generate login credentials for user
    router.get(basePath + path + '/download/:fileName', responseMiddleWare(), controller.downloadTemplate);
}