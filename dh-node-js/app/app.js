/**
 * App
 * 
 */

"use strict";

require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const { sw, swUIOptions } = require("./config/swagger/swagger.config");
const bodyParser = require("body-parser");
const auths = require("basic-auth");

const compression = require("compression");
const express = require("express");
const cors = require("cors");
const { saveLogs } = require("./middlewares/loggingMiddleware");

const ExcelController = require('../app/controllers/excel.controller');
const LoginController = require('../app/controllers/login.controller');

require("./helpers/prototype.helper");

global.__basedir = __dirname + "/..";

const app = express();

/***************************** Handling Cors error *****************************/
// const defaultCorsConfig = {
//   "origin": "*",
//   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//   "preflightContinue": false,
//   "optionsSuccessStatus": 204
// };

const defaultCorsConfig = {
    "origin": "*"
};

// If you do not want to block REST tools or server-to-server requests, add a !origin check in the origin function like so:
var whitelist = ['http://localhost', 'http://localhost:3000/']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, { origin: true, methods: "OPTION,GET" })
        }
        else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

// open this code to apply cors on all APIs except for socket requests
// or we can use this as a middleware for a particular API
app.use(cors(defaultCorsConfig));


//Global variables
global.requester = {
    id: "user-01"
}
// set information for api requester
const getHeaders = (req, res, next) => {
    if (req.headers?.user) {
        const requesterData = JSON.parse(req.headers);
        requester.id = requesterData.id;
    }
    next();
}
app.use(getHeaders);



/********************************* End of Cors ********************************/

// validate request
app.use((req, res, next) => {
    bodyParser.json()(req, res, (err) => {
        if (err) {
            console.error(err);
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Invalid JSON data",
                    errors: { error: "Invalid JSON data" },
                });
        }
        next();
    });
});

// Body parser, reading data from body into req.body
// Validate request payload size
app.use(
    bodyParser.json({
        limit: "10kb",
    })
);
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: "10kb",
    })
);

// Compress all HTTP responses
const shouldCompress = (req, res) => {
    if (req.headers["x-no-compression"]) {
        // don't compress responses if this request header is present
        return false;
    }

    // fallback to standard compression
    return compression.filter(req, res);
};

app.use(
    compression({
        // filter decides if the response should be compressed or not,
        // based on the `shouldCompress` function above
        filter: shouldCompress,
        // threshold is the byte threshold for the response body size
        // before compression is considered, the default is 1kb
        threshold: 0
    }));
// app.use(compression());

// save all http req and res into logger service
app.use(saveLogs);


app.use('/', LoginController)
    .use('/excel', ExcelController);

// swagger
// Swagger should be after routes import

app.use(
    "/api-docs",
    (req, res, next) => {
        let user = auths(req);
        if (
            user === undefined ||
            user["name"] !== process.env.SWAGGER_USER ||
            user["pass"] !== process.env.SWAGGER_PASSWORD
        ) {
            res.statusCode = 401;
            res.setHeader("WWW-Authenticate", 'Basic realm="Node"');
            res.end("Unauthorized");
        }
        else {
            next();
        }
    },
    swaggerUi.serve,
    swaggerUi.setup(sw, swUIOptions)
);


// Error handling
app.get('/error', (req, res) => {
    res.send("Custom error landing page.")
})

function errorLogger(error, req, res, next) { // for logging errors
    console.error(error) // or using any fancy logging library
    next(error) // forward to next middleware
}

function errorResponder(error, req, res, next) { // responding to client
    if (error.type == 'redirect')
        res.redirect('/error');
    else if (error.type == 'time-out') // arbitrary condition check
        res.status(408).send(error);
    else
        next(error); // forwarding exceptional case to fail-safe middleware
}

function failSafeHandler(error, req, res, next) { // generic handler
    res.status(500).send(error)
}

app.use(errorLogger);
app.use(errorResponder);
app.use(failSafeHandler);

// DB sync, It will remove all data in the table
// Production mode 
// PostgresDB
const db = require("./models/index");
// db.sequelize.sync();

// Development mode
db.sequelize.sync({ force: false }).then(() => {
    console.log("Drop and re-sync db.");
});


module.exports = app;
