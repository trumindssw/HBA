const jwt = require("jsonwebtoken");
const { logger } = require("../config/logger/logger");

const config = process.env;

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
      // Check if bearer is undefined
      if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];

        if (!bearerToken) {
            logger.error('Token missing')
            return res.status(403).json({message: "A token is required for authentication"});
        }
        try {
            const decoded = jwt.verify(bearerToken, config.JWT_SECRET);
            req.user = decoded;
        }
        catch (err) {
            logger.error('Invalid Token');
            return res.status(401).json({message: "Invalid Token"});
        }
    } else {
        logger.error('Token not provided');
        res.status(999).json({message: 'Authentication Token Not Provided'});
    }
    return next();
};

module.exports = verifyToken;