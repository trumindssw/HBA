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

// Creating HTTP server
const server = http.createServer(app);

// Starting server (http)
server.listen(appConfig.SERVER_PORT, () => {
    logger.info(`Node service running on port ${appConfig.SERVER_PORT}`);
})
