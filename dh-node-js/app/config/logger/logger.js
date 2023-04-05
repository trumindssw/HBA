/**
 * Logger config
 * 
 */


const { createLogger, transports } = require("winston");

// prioritizes logging levels from 0 (highest level of severity) to 5 (lowest level of severity):
// 0: error
// 1: warn
// 2: info
// 3: verbose
// 4: debug
// 5: silly


const options = {
    file: {
        level: 'info',
        filename: '../logs/app.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    notification_file: {
        level: 'error',
        filename: '../logs/notification.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    http_file: {
        level: 'error',
        filename: '../logs/http.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

// A common logger
const logger = createLogger({
    transports: [
        new transports.Console(options.console),
        new transports.File(options.file)
    ]
});

// Creating logger for notification
const notificationLogger = createLogger({
    transports: [
        new transports.Console(options.console),
        new transports.File(options.notification_file)
    ]
});

// Creating logger for http calls
const httpLogger = createLogger({
    transports: [
        new transports.Console(options.console),
        new transports.File(options.http_file)
    ]
});

module.exports = {
    logger,
    notificationLogger,
    httpLogger
};
