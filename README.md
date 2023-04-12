# HBA

## APIs

### Login
URL: http://localhost:5000/login
HTTP: POST
Body: {"username": "hyperbus", "password": "123456"}

### Upload File
URL: http://localhost:5000/excel/upload
HTTP: POST
Body: .xls/.xlsx file

### Get Prev Uploaded Filed
URL: http://localhost:5000/excel/getUploadedFiles
HTTP: GET

### Download a file
URL: http://localhost:5000/excel/download/:fileName
HTTP: POST
Params: template='false', fileName=<name>

### Download a the sample file format
URL: http://localhost:5000/excel/download/UploadTemplate
HTTP: POST
Params: template='true'

### Verify Subjects Request
URL: http://localhost:5000/request/verify
HTTP: POST
Body: 
[
    {
        "firstName": "Shravani",
        "lastName": "T V",
        "issuingAuthority": "Amity University",
        "document": "BCA",
        "startDate": "2017-08-13",
        "endDate": "2019-08-13"
    }
]

### Get all requests processed
URL: http://localhost:5000/request/getAllRequests
HTTP: GET

### Get a request detail
URL: http://localhost:5000/requests/getRequestDetail
HTTP: GET
Params: requestID


