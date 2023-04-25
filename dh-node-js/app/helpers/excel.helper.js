const validateRowData = (row) => {
    try {
        console.log(row.startDate, new Date(row.startDate), isFinite(new Date(row.startDate)))
        if(!(row.regNumber && 
            row.firstName && 
            row.issuingAuthority && 
            row.document && 
            isFinite(new Date(row.startDate)) && isFinite(new Date(row.endDate)) &&
            new Date(row.startDate) < new Date(row.endDate))) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err)
    }
}

const validateRowDataWithSNo = (row) => {
    try {
        // console.log(row['S.No'], row.regNumber && row.firstName)
        if(row['S.No'] && Object.keys(row).length==1) {
            console.log("I should be in ")
            return true;
        }
        return false;
    } catch (err) {
        console.log(err);
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

const isValidDate = (startDate, endDate) => {
    try {
        if(!(startDate && endDate)) {
            return false;
        }
        if(isFinite(new Date(startDate)) && isFinite(new Date(endDate))) {
            return true;
        } else {
            return false;
        }
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    validateRowData,
    getMissingFields,
    validateHeaders,
    validateRowDataWithSNo,
    isValidDate
}