const validateRowData = (row) => {
    try {
        if(!(row[1] && row[2] && row[4] && row[6] && row[7])) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    validateRowData
}