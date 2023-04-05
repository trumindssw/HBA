/**
 * Server 
 * 
 */

 const http = require("http");
 const app  = require("./app/app");
 const appConfig = require("./app/config");
 const { logger } = require('./app/config/logger/logger'); // winston logger
 const { httpLogger } = require('./app/config/logger/httpLogger'); // morgan logger 
 app.use(httpLogger);

// app.use(httpLogger);

// Setup apm logging
// Add this to the VERY top of the first file loaded in your app
// if (appConfig.log.ENABLE_APM) {
//     console.log(`APM server enabled and info will be posted to ${appConfig.log.APM_SERVER_URL}`);
//     const apm = require("elastic-apm-node").start({
//         // Override service name from package.json
//         // Allowed characters: a-z, A-Z, 0-9, -, _, and space
//         serviceName: `${appConfig.log.APM_SERVICE_NAME_PREFIX}-SERVER`,
//         // Use if APM Server requires a token
//         secretToken: "",
//         // Use if APM Server uses API keys for authentication
//         apiKey: "",
//         environment: appConfig.log.APM_ENV,
//         // Set custom APM Server URL (default: http://localhost:8200)
//         serverUrl: appConfig.log.APM_SERVER_URL,
//     });
// }


// Creating HTTP server
const server = http.createServer(app);

// Starting server (http)
server.listen(appConfig.SERVER_PORT, () => {
    logger.info(`Node service running on port ${appConfig.SERVER_PORT}`);
})
