/**
 * Aim is to make one dynamic wrapper for most DBs
 * 1. First we will get the active database name through env variable selected DB
 * 2. Then we will pick the models for that DB.
 * 3. Then we will prepare dynamic queries based on the route.
 */

const { DATABASE } = require("../config/index");

const ORMs = {
    "sequelize": {
        "create": "create",
        "get": "findAll",
        "update": "update",
        "delete": "destroy",
        "getOne": "findOne",
    },
    "mongoose": {
        "create": "create",
        "get": "find",
        // "update": "findByIdAndUpdate",
        // "delete": "findByIdAndDelete"
        "update": "findOneAndUpdate",
        "delete": "findOneAndDelete",
        "getOne": "findOne",
    }
}
const methodList = {
    "mysql": {
        ...ORMs.sequelize
    },
    "mssql": {
        ...ORMs.sequelize
    },
    "postgres": {
        ...ORMs.sequelize
    },
    "mongodb": {
        ...ORMs.mongoose
    }
}

//mention examples here, so that we can decide the input format as easy as possible

const createRecord = async (model, params1 = {}, params2 = {}) => {
    try {
        const dbModel = require(`../models/${DATABASE}/${model}.model`);
        // const result = await dbModel[methodList[DATABASE]["create"]](data, options = {}); //mongoose/sequelize with options
        let result = [];
        if (DATABASE === "postgres") {
            result = await dbModel[methodList[DATABASE]["create"]](params1, params2);
        }
        else if (DATABASE === "mongodb") {
            result = await dbModel[methodList[DATABASE]["create"]](params1); //passing params2 will create duplicate object with values null
        }
        return result;
    } catch (error) {
        console.log('create-error: ', error);
        throw error;
    }
}

const getOneRecord = async (model, params1 = {}, params2 = {}, params3 = {}) => {
    try {
        const dbModel = require(`../models/${DATABASE}/${model}.model`);
        let result = {};
        if (DATABASE === "postgres") {
            result = await dbModel[methodList[DATABASE]["getOne"]]({ ...params1, ...params2, ...params3 });
        }
        else if (DATABASE === "mongodb") {
            result = await dbModel[methodList[DATABASE]["getOne"]](params1, params2, params3);
        }
        // return JSON.parse(JSON.stringify(result));
        return result;
    } catch (error) {
        console.log('get-one-error: ', error);
        throw error;
    }
}

const getRecords = async (model, params1 = {}, params2 = {}, params3 = {}) => {
    try {
        const dbModel = require(`../models/${DATABASE}/${model}.model`);
        // const selectedTable = await dbModel[methodList[DATABASE]["get"]];
        // mention input here, to prepare the format
        console.log("+++++++ ", params1, params2, params3)
        let result = [];
        console.log('check-this: ',methodList, methodList[DATABASE])
        if (DATABASE === "postgres") {
            console.log("WOAHOHOHOH")
            result = await dbModel[methodList[DATABASE]["get"]]({ ...params1, ...params2, ...params3 });
            console.log("^^^^^^^^^^^^^^^^^", result)
        }
        else if (DATABASE === "mongodb") {
            result = await dbModel[methodList[DATABASE]["get"]](params1, params2, params3);
        }
        // const result = await dbModel[methodList[DATABASE]["get"]](filters, projection, options); //mongoose with options
        // const result = selectedTable(filters, projection, options).populate(`<referred model name>`); //mongoose with options, populate will help to JOIN data from other tables.
        // const result = selectedTable(data); //sequelize ; options contains filters, projection, and self
        // return JSON.parse(JSON.stringify(result));
        return result;
    } catch (error) {
        console.log('get-error: ', error);
        throw error;
    }
}

const updateRecords = async (model, params1 = {}, params2 = {}, params3 = {}) => {
    try {
        const dbModel = require(`../models/${DATABASE}/${model}.model`);
        let result = [];
        if (DATABASE === "postgres") {
            result = await dbModel[methodList[DATABASE]["update"]](params1, { ...params2, ...params3 });
        }
        else if (DATABASE === "mongodb") {
            result = await dbModel[methodList[DATABASE]["update"]](params2, params1, params3);
        }
        // const result = await dbModel[methodList[DATABASE]["update"]](id, updateParams, options); //mongoose with options ; use findOneAndUpdate so that we have {_id: 1}
        // const result = await dbModel[methodList[DATABASE]["update"]](updateParams, options); //sequelize ; options include where clause which will contain id
        return result;
    } catch (error) {
        console.log('update-error: ', error);
        throw error;
    }
}

const deleteRecord = async (model, data) => {
    try {
        const dbModel = require(`../models/${DATABASE}/${model}.model`);
        const result = await dbModel[methodList[DATABASE]["delete"]](data);
        // const result = await dbModel[methodList[DATABASE]["delete"]](id, options); //mongoose with options ; use findOneAndDelete so that we have {_id: 1}
        // const result = await dbModel[methodList[DATABASE]["delete"]](data); //sequelize ; options include where clause which will contain id
        // const result = await dbModel[methodList[DATABASE]["delete"]]({where: {_id: 1}}); //sequelize ; options include where clause which will contain id
        return result;
    } catch (error) {
        console.log('purge-error: ', error);
        throw error;
    }
}

module.exports = {
    createRecord,
    getRecords,
    updateRecords,
    deleteRecord,
    getOneRecord
}