const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger/logger');

const login = (body) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info('Inside login service')
            const { username, password } = body;
            if (username == "hyperbus" && password == "123456") {
                jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '3000s' }, (err, token) => {
                    logger.info(`User ${username} logged in`)
                    return resolve({token, status: 200});
                });
            }
            else {
                logger.error(`Unauthorized Access`);
                return reject({ message: "Unauthorized access!!!", status: 401 });
            }
        } catch (err) {
            reject(err)
        }
    });
}

module.exports = {
    login
}