// Message dictionary
const messages = (key, item) => {
    const msg = {
        "db-create-record": `${item} created successfully.`,
        "db-create-error-record": `Unable to Create ${item}`,
        "db-update-record": `${item} updated successfully.`,
        "db-update-error-record": `Unable to update ${item}`,
        "db-delete-record": `${item} deleted successfully.`,
        "db-delete-error-record": `Unable to delete ${item}`,
        "db-get-record": `Success`,
        "db-get-error-record": `Failed`,
        "db-filter-record": `Filtered successfully`,
        "db-filter-error-record": `Search failed`,
        "db-not-found-record": `${item} not found`,
        "db-missing-input": `All input is required`,
        "db-already-registered": "User Already Exist. Please Login",
        "db-invalid-creds": "Invalid Credentials",
        "db-register-record": `User Registration Successful.`,
        "db-register-error-record": `User Registration Unsuccessful.`,
        "db-login-record": `User Login Successful.`,
        "db-login-error-record": `User Login Unsuccessful.`,
        "sw-201-req": `${item} created successfully.`,
        "sw-202-req": `${item} deleted successfully.`,
        "sw-200-req": `Success`,
        "sw-validate-error-req": `Validator Error: Incorrect Payload | Failed`,
        "sw-server-error-req": `Internal Server Error`,
    };

    return msg[key];
}

const getMessage = (key, item) => {
    return messages(key, item);//.toSentenceCase();
}

module.exports = {
    getMessage
}