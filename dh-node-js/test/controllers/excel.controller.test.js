// const httpMocks = require('node-mocks-http');
// const { describe, it, expect, afterAll } = require('@jest/globals');
// const { mockFilesArray } = require("../mocks/excel.mock.js");

// jest.mock('../../app/services/excel.service.js');

// const excelService = require('../../app/services/excel.service.js');
// const excelController = require('../../app/controllers/excel.controller.js');

// const mockGetUploadedFiles = jest.spyOn(excelService, 'getUploadedFiles')

// describe('excel controller - unit tests', () => {
//     it('should get uploaded files list', async () => {
//         // mock
//         const response = httpMocks.createResponse();
//         const request = httpMocks.createRequest();
//         const mockFilesList = jest.fn(async () => {
//             return mockFilesArray;
//         });
//         mockGetUploadedFiles.mockImplementation(mockFilesList);
//         await excelController.getUploadedFilesController(request, response);
//         expect(mockGetUploadedFiles).toHaveBeenCalledTimes(1);
//         var res = []
//         response._getJSONData().data.map(obj => {
//             // console.log("@@@@ : ", obj.hasOwnProperty('fileName'));
//             res.push(['fileName', 'createdAt'].every(key => obj.hasOwnProperty(key)));
//         })
//         // console.log(res)
//         expect(response.statusCode).toEqual(200);
//         expect(response._isEndCalled()).toBeTruthy();
//         expect(response._getJSONData()).toEqual({ status: 1, message: 'List of Files Uploaded', data: mockFilesArray });
//         expect(res).toEqual(new Array(response._getJSONData().data.length).fill(true));
//     });

//     it('error in getting uploaded files', async () => {
//         const response = httpMocks.createResponse();
//         const request = httpMocks.createRequest();
//         // await excelController.getUploadedFilesController(request, response);
//         // console.log(response._getJSONData());
//         // expect()
//         expect(() => excelController.getUploadedFilesController(null, response)).toThrow({ error: new Error("Some error occurred while retrieving files.") });
//     })
// });

// afterAll(() => {
//     jest.clearAllMocks();
// });

const httpMocks = require('node-mocks-http');
const { getUploadedFilesController } = require('../../app/controllers/excel.controller');
const ExcelServices = require('../../app/services/excel.service');
const { sendResponse } = require('../../app/helpers/util.helper');

// Mock dependencies
jest.mock('../../app/services/excel.service');
jest.mock('../../app/helpers/util.helper');

describe('getUploadedFilesController', () => {
    let req, res;

    beforeEach(() => {
        // res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        res = jest.fn();
        req = httpMocks.createRequest();
        console.log("Request: ", req);
        console.log("Response: ", res);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should call ExcelServices.getUploadedFiles and send response with files', async () => {

        const files = ['file1.xlsx', 'file2.xlsx'];
        ExcelServices.getUploadedFiles.mockResolvedValueOnce(files);

        // console.log(getUploadedFilesController(req, res))
        // mockGetUploadedFiles.mockImplementation(files);

        await getUploadedFilesController(req, res);
        expect(ExcelServices.getUploadedFiles).toHaveBeenCalledTimes(1);
        console.log(sendResponse == res);
        expect(sendResponse).toHaveBeenCalledWith(res, 'List of Files Uploaded', files);

    });

    test('should call ExcelServices.getUploadedFiles and send error response', () => {

        const error = new Error('Failed to fetch uploaded files');
        ExcelServices.getUploadedFiles.mockRejectedValueOnce(error);

        expect.assertions(3); // Expecting 3 assertions within the test case

        getUploadedFilesController(req, res).catch((err) => {
            expect(err.message).toBe(error.message);
        });

        expect(ExcelServices.getUploadedFiles).toHaveBeenCalledTimes(1);
        expect(sendResponse).toHaveBeenCalledWith(res, error.message, null, error);
    });
});
