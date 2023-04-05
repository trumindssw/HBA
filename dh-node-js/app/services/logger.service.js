/**
 *  Service for Calling Logger Service
 *
 */


const axios = require('axios');
const appConfig = require('../config');

//send logs
const sendLogs = (data) => {
    try {
        const payload = { "logs": data };
        const options = {
            headers: {
                'service': 'node-base-project',
            }
        };
        const url = `${appConfig?.LOGGER_HTTP_ENDPOINT}/logs`;

        axios.post(url, payload, options)
            .then((response) => {
                console.log("Send logs to logger service Successfully")
                return response;
            })
            .catch((error) => {
                console.log("Send logs to logger service failed");
                return error;
            });
    }
    catch (error) {
        console.log("Send logs to logger service failed");
        return error;
    }
}


module.exports = { sendLogs }