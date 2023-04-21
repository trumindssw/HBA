const validateRowData = (row) => {
    try {
        if(!(row.regNumber && row.firstName && row.issuingAuthority && row.document)) {
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
        if(!row.regNumber) {
            fields.push('Reg Number');
        }
        if(!row.firstName) {
            fields.push('First Name');
        }
        if(!row.issuingAuthority) {
            fields.push('Issuing Authority');
        }
        if(!row.document) {
            fields.push('Document');
        }
         return fields;
    } catch (err) {
        return [];
    }
}

const validateHeaders = (headers) => {
    try {
        console.log(headers)
        let givenHeaders = [
            'S.No', 
            'regNumber', 
            'firstName',
            'middleName',
            'lastName', 
            'issuingAuthority', 
            'department',
            'document',
            'startDate',
            'endDate'
        ];
        console.log(givenHeaders.sort())

        if(JSON.stringify(givenHeaders.sort()) == JSON.stringify(headers.sort())) {
            return true;
        }
        else {
            return false;
        }

    } catch (err) {
        reject(err)
    }
}

module.exports = {
    validateRowData,
    getMissingFields,
    validateHeaders
}