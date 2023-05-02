const requestObject = (reqId, veriflowId, firstName, lastName, issuingAuthority,
    document, department, startDate, endDate, statusCode, status) => {
    try {
        let req = {
            requestID: reqId,
            veriflowID: veriflowId,
            subjectName: (firstName && lastName) ? firstName + " " + lastName : ((firstName) ? firstName : (lastName) ? lastName : null),
            issuingAuthority: issuingAuthority ? issuingAuthority : null,
            document: document ? document : null,
            department: department ? department : null,
            startDate: startDate ? startDate : null,
            endDate: endDate ? endDate : null,
            statusCode: statusCode,
            status: status,
            statusMessage: (status == -1) ? 'Internal Server Error' : ((status == 0) ? 'Match Not found' : 'OK'),
        };
        return req;
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    requestObject
}