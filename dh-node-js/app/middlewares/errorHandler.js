/**
 * Handling the error of API
 *
 */

const handleError = (res, err = {}) => {
    if (err.message && err.message !== "Forbidden") {
        res
            .status(400)
            .send({ status: false, message: err.message, errors: err["err"] });
    }
    else if (err.message === "Forbidden") {
        res
            .status(403)
            .send({ status: false, message: "Unauthorized access - Forbidden" });
    }
    else {
        res.status(500).send({ status: false, message: "Internal Server Error" });
    }
};

module.exports = { handleError };
