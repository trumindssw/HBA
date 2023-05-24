const request = require('supertest');
const dB = require('../../app/models');
const express = require("express");
const router = express.Router();

const app = express();
app.use('/', router);

jest.mock('../../app/models')
describe('GET /download', () => {
    test('should return the file with the provided fileName', async () => {
        const fileName = 'example-file.xlsx';

        // Mock the Files.findOne method to return a file object
        const findOneMock = jest.fn().mockResolvedValue({
            id: 123,
            data: Buffer.from('mocked file data'),
        });
        console.log(findOneMock)
        jest.spyOn(dB.files, 'findOne').mockResolvedValue(findOneMock);

        const response = await request(app)
            .get('/excel/download')
            .query({ fileName });

        console.log(response);

        expect(response.status).toBe(200);
        expect(response.header['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(response.header['content-disposition']).toBe(`attachment; filename=${fileName}`);
        expect(response.body).toEqual(Buffer.from('mocked file data'));
        expect(findOneMock).toHaveBeenCalledWith({ where: { fileName } });
    });

    test('should return an error message if fileName is not provided', async () => {
        const response = await request(app).get('/download');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Please provide a fileName');
    });

    test('should return an error message if no file with the provided fileName is found', async () => {
        const fileName = 'nonexistent-file.xlsx';

        // Mock the Files.findOne method to return null
        const findOneMock = jest.fn().mockResolvedValue(null);
        jest.spyOn(dB.files, 'findOne').mockImplementation(findOneMock);

        const response = await request(app)
            .get('/download')
            .query({ fileName });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(`No such file with filename: ${fileName}`);
        expect(findOneMock).toHaveBeenCalledWith({ where: { fileName } });
    });
});
