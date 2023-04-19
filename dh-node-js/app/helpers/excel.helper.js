const validateRowData = (row) => {
    try {
        if(!(row[1] && row[2] && row[5] && row[7])) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err)
    }
}

const getMissingFields = (row) => {
    try {
        let fields = []
        if(!row[1]) {
            fields.push('Reg Number');
        }
        if(!row[2]) {
            fields.push('First Name');
        }
        if(!row[5]) {
            fields.push('Issuing Authority');
        }
        if(!row[7]) {
            fields.push('Document');
        }
         return fields;
    } catch (err) {
        return [];
    }
}

module.exports = {
    validateRowData,
    getMissingFields
}