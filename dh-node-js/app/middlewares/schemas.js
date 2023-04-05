/**
 * Validator Schema Definition
 *
 */

const Joi = require("joi");

const joiSchemas = {
    auth: {
        register: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required(),
        }),
        login: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        }),
    },
    user: {
        create: Joi.object({
            authId: Joi.string().required(),
            email: Joi.string().email().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
        }),
        list: Joi.object({
            page: Joi.number(),
            limit: Joi.number()
        }),
        search: Joi.object({
            page: Joi.number(),
            limit: Joi.number(),
            filter: Joi.object({}),
        }),
        getById: Joi.object({
            id: Joi.string().required(),
        }),
        getByAuthId: Joi.object({
            authId: Joi.string().required(),
        }),
        update: Joi.object({
            authId: Joi.string().required(),
            id: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().required()
        }),
        delete: Joi.object({
            id: Joi.string().required(),
        }),
    },
    order: {
        create: Joi.object({
            userId: Joi.string().required()
        }),
        list: Joi.object({
            page: Joi.number(),
            limit: Joi.number()
        }),
        search: Joi.object({
            page: Joi.number(),
            limit: Joi.number(),
            filter: Joi.object({}),
        }),
        getById: Joi.object({
            id: Joi.string().required(),
        }),
        delete: Joi.object({
            id: Joi.string().required(),
        }),
    }
};

module.exports = { joiSchemas };
