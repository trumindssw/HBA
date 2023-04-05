/**
 * Validator for API request 
 * 
 */

const validator = (joiSchema) => {
    return (req, res, next) => {
        try {
            const options = {
                abortEarly: false, // include all errors
                allowUnknown: true, // ignore unknown props
                stripUnknown: false // remove unknown props
            };
            const body = { ...req.body, ...req.query, ...req.params, ...req.headers };
            const { error, value } = joiSchema.validate(body, options);

            if (error) {
                let err = {};
                error.details.map((errElem) => {
                    err[errElem.path] = errElem.message.replace(/['"]+/g, '');
                })
                return res.promise(Promise.reject({ message: err[Object.keys(err)[0]], err: err }));
            }
            return next();
        }
        catch (error) { return res.promise(Promise.reject({ message: 'Request Failed', err: error })); }
    }
}
module.exports = { validator };