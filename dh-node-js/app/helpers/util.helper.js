const deepCopy = (data) => {
    return JSON.parse(JSON.stringify(data));
}

const isEmptyObject = (obj) => {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
};

module.exports = {
    deepCopy,
    isEmptyObject
}
