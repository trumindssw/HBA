/**
 * Register Route
 *
 */

const fs = require("fs");
const path = require("path");
const basename = path.basename(module.filename);

// Loop through all files and initialize routes.
module.exports = (basePath, router, webSocket = null) => {
    console.log(`Registering all routes recursively for all files in routes folder`);
    // Read all model files recursively and do the sequelize import
    fs.readdirSync(__dirname)
        .filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js")
        .forEach((file) => {
            require(path.join(__dirname, file))(basePath, router, webSocket);
        });
};