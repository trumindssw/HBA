/***
 *
 * Controller class for login.
 * @file login.controller.js
 * @description Login controller
 */

//const modl = "login";

const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');


const login = (req, res) => {

    const { username, password } = req.body;

    if (username == "hyperbus" && password == "123456") {
        jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '300s' }, (err, token) => {
            res.status(200).json({
                status: 1,
                token
            });
        });
    }
    else {
        res.status(401).json({
            status: 0,
            message: "Unauthorized access!!!"
            
        });
    }
}


module.exports = {
    login,
};