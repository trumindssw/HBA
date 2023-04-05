/**
 * Reads configuration from envfile and expose it
 * as via config object. Config object in turn can read the values from environment variables
 * This is to ensure that we keep all configurations in one place and dont' use process.env in multiple places
 *
 * If there is a default value specified here, it is not necessary have that entry in the .env file unless you need to override
 * that value in your dev environment (For instance if you need to change the log level from info to warn don't change it here, but override
 * in the .env file)
 *
 * Create a file named .env in the root folder and add all the required env variables there
 *      1) DO NOT CHECKIN .env FILE TO SOURCE CONTROL.
 *
 */
const appConfig = {
    APP_NAME: process.env.APP_NAME || "Node.js",
    SERVER: process.env.HOST || "localhost",
    SERVER_PORT: process.env.PORT || 5000,
    SERVER_SESSION_SECRET: process.env.SERVER_SESSION_SECRET || "nodejs##",
    BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
    AWS: {
        region: process?.env?.AWS_DEFAULT_REGION,
    },
};
if (process?.env?.AWS_ACCESS_KEY_ID) {
    appConfig.AWS.accessKeyId = process?.env?.AWS_ACCESS_KEY_ID;
}
if (process?.env?.AWS_SECRET_ACCESS_KEY) {
    appConfig.AWS.secretAccessKey = process?.env?.AWS_SECRET_ACCESS_KEY;
}
if (process?.env?.LOGGER_HTTP_ENDPOINT) {
    appConfig.LOGGER_HTTP_ENDPOINT = process?.env?.LOGGER_HTTP_ENDPOINT;
}
if (process?.env?.ACTIVE_DATABASE || process?.env?.DB) {
    appConfig.DATABASE = process?.env?.ACTIVE_DATABASE || process?.env?.DB;
}
if (process?.env?.JWT_SECRET) {
    appConfig.TOP_SECRET = process?.env?.JWT_SECRET;
}

module.exports = appConfig;
