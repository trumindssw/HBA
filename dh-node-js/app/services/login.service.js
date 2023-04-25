const jwt = require('jsonwebtoken');

const login = (body) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { username, password } = body;
            if (username == "hyperbus" && password == "123456") {
                jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '3000s' }, (err, token) => {
                    return resolve({token, status: 200});
                });
            }
            else {
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