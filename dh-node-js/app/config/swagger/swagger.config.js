/**
 * Swagger config
 * 
 */

const { getMessage } = require('../../helpers/message.helper');
const gSch = {
    status: {
        type: "string",
        example: "true",
    },
    message: {
        type: "string",
        example: "",
    }
};
const sch = {
    type: "object",
    properties: {
        400: {
            ...gSch,
            errors: {
                type: 'object',
                properties: {
                    err: {
                        type: 'string',
                        example: 'Error Message'
                    }
                }
            }
        },
        500: {
            ...gSch
        }
    },
};
const resStruct = ({ model = "item", props = { 201: { data: { id: { type: "number", example: 10001 } } } } }) => {

    let res = {
        400: {
            description: "Request Failed",
            schema: {
                ...sch,
                properties: {
                    ...sch?.properties["400"],
                    message: { ...sch?.properties["400"]?.message, example: getMessage("sw-validate-error-req", model) },
                    error: props["400"]?.error || props?.error || {}
                }
            }
        },
        500: {
            description: "Request Failed",
            schema: {
                ...sch,
                properties: {
                    ...sch?.properties["500"],
                    message: { ...sch?.properties["500"]?.message, example: getMessage("sw-server-error-req", model) }
                }
            }
        }
    };

    for (let prop in props) {
        res[prop] = {
            description: "Success",
            schema: {
                ...sch,
                properties: (prop != 204 ? ({
                    ...gSch,
                    message: { ...gSch?.message, example: getMessage(`sw-${prop}-req`, model) },
                    [Object.keys(props[prop])[0]]: {
                        type: "object",
                        properties: {
                            ...props[prop][Object.keys(props[prop])[0]]
                        }
                    }
                }) : { message: { ...gSch?.message, example: getMessage(`sw-${prop}-req`, model) } })
            }
        };
    }

    // console.log("resssssssssssssss---- ", JSON.stringify(res));
    return res;
};
const swUIOptions = {
    explorer: false,
    swaggerOptions: {
        authAction: {
            Bearer: {
                name: "Bearer",
                schema: {
                    type: "apiKey",
                    in: "header",
                    name: "Authorization"
                },
                value: "Bearer <JWT>"
            }
        }
    },
    customCss: '.swagger-ui .topbar { display: none }'
};

let sw = {
    "swagger": "2.0",
    "info": {
        "description": process.env.DESCRIPTION,
        "version": process.env.VERSION,
        "title": process.env.APP_NAME
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header"
        }
    },
    host: process.env.SWAGGER_URL,
    // "host": process.env.HOST + ':' + process.env.PORT,
    // "host": os.hostname() + ':' + process.env.PORT,
    "basePath": "/api",
    "schemes": [
        "http", "https"
    ],
    "paths": {}
}

swaggerPaths = config => {
    apiConfig(config, (p) => {
        let res = sw.paths[p.api];
        if (!res) { res = {}; }
        res[p.method] = {
            summary: p.summary,
            tags: [p.tags],
            produces: ["application/json"],
            responses: (p.responses ? (
                { ...resStruct({ model: p?.model || "item", props: p.responses }) }
            ) : {}),
        };
        // console.log("swagger.config.js p.tags ==== ", p.tags.toLowerCase());

        if (p.tags.toLowerCase() != "auth") {
            res[p.method]["security"] = [{
                "Bearer": []
            }];
        }
        if (p.parameters) { res[p.method].parameters = p.parameters; }
        if (p.items) { res[p.method].items = p.items; }

        sw.paths[p.api] = res;
        // console.log(sw);
    });
    // console.log(JSON.stringify(sw));
    // fs.writeFile("output.json", JSON.stringify(sw), 'utf8', function (err) {
    //     if (err) {
    //         console.log("An error occured while writing JSON Object to File.");
    //         return console.log(err);
    //     }     
    //     console.log("JSON file has been saved.");
    // });   
}

apiConfig = (config, callback) => {
    let params = { "api": "", "method": "post", "summary": "", "tags": "", "parameters": [] };
    if (typeof (config) == 'object') {
        for (c in config) {
            // console.log(c);
            if (Array.isArray(config[c])) {
                config[c].forEach(prm => {
                    if (typeof (prm) == 'object') {
                        params.parameters.push(prm);
                    }
                    else if (!Array.isArray(prm)) {
                        let obj = { name: prm, type: "string", in: "formData" };
                        params.parameters.push(obj);
                    }
                })
            }
            else {
                let caseSmall = ["method"];
                params[c] = config[c];
                if (caseSmall.includes(c)) {
                    params[c] = params[c].toLowerCase();
                }
            }
        }
    }
    callback(params);
}

module.exports = {
    swUIOptions,
    sw,
    swagger: swaggerPaths,
    resStruct
}