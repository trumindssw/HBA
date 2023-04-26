/**
 * Logger config
 * 
 */


const { createLogger, transports, addColors } = require("winston");
require('winston-daily-rotate-file');
const winston = require('winston')
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
        filename: '../logs/app-%DATE%.log',
        auditFile: '../logs/audit-log.json',
        handleExceptions: true,
        maxSize: '1m', // 1MB
        maxFiles: 5,
        colorize: true
    },
    http_file: {
        level: 'error',
        filename: '../logs/http-%DATE%.log',
        auditFile: '../logs/audit-http-log.json',
        handleExceptions: true,
        maxSize: '1m', // 5MB
        maxFiles: 5,
        colorize: true,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(
        info => `[${info.level.toUpperCase()}] ${info.timestamp} : ${info.message}`
     ),);

let transportFile = new transports.DailyRotateFile(options.file);
let transportHttpFile = new transports.DailyRotateFile(options.http_file);

transportFile.on('rotate', function(oldFilename, newFilename) {
    console.log(new Date(), oldFilename, newFilename)
});

transportHttpFile.on('rotate', function(oldFilename, newFilename) {
    console.log(new Date(), oldFilename, newFilename)
});


// A common logger
const logger = createLogger({
    format: logFormat,
    transports: [
        new transports.Console(options.console),
        transportFile
    ]
});

// Creating logger for http calls
const httpLogger = createLogger({
    format: logFormat,
    transports: [
        new transports.Console(options.console),
        transportHttpFile
    ]
});

module.exports = {
    logger,
    httpLogger
};
