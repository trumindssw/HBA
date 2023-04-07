const ctrl = "login";

const controller = require(`../controllers/${ctrl}.controller`);
const path = `/${ctrl}`;

// response handler middleware
const responseMiddleWare = require("../middlewares/responseHandler");

// validations middleware

/*
const { validator } = require("../middlewares/validations");
const { joiSchemas } = require('../middlewares/schemas');
const schema = joiSchemas[ctrl];
const upload = require("../middlewares/upload");
*/

module.exports = (basePath, router) => {
    console.log(`Login ${basePath} ----- ${path} routes`);
    router.post(basePath + path + '/',  responseMiddleWare(), controller.login);
}