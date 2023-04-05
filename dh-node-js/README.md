# Node JS

## Getting started
This project is a standard for NodeJS Backend projects. This standard template can be used as a build-up for other projects.

##Prerequisites
- [ ] Install NodeJS. [Reference to install latest stable version](https://nodejs.org/en/)
- [ ] [Install nodemon module through npm, will be used in running the server](https://www.npmjs.com/package/nodemon)

## Start Backend Server
To run the backend server, go inside the repo (inside the NODE-TS folder) through CLI, and run the following commands:
1. npm install (Only when new package is installed)
2. npm run start
Backend Server will be started on the specified port.

## Directory Structure
We have an app/src folder which contains all our code.
###config
This folder contains all the configurations for project's related components like DB, Swagger, Logger etc.

### controllers
This folder contains the code files, having functions through which the specified operation will be done. The functions are dynamic i.e. One function, multiple exports.

### helpers
This folder contains the code files, having functions through which we need to do small operations. Ex: It we want to get UTC date time, we can put that getUTCDateTime function in that file, or if we are performing encrypt/decrypt operation, we can put that code in this folder.

### middlewares
This folder contains the code files, having functions through which we can control/modify the data received as output from other functions so as to pass it to next functions.

### models
This folder contains the files, having validation structure for each of the component of the project. Ex: If user module is there, then we will place all the schema here, so as to validate the input for user API against this schema.

### routes
This folder contains the files, having routes for every controller. Each controller will have one route file. The routes are then used in express app.

### services
This folder contains the files, having functions to validate the input for the respective API, against the schema defined in models.

### app.ts
This file contains, the express application configuration, and initializing the routes etc with it.