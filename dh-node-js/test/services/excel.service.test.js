const { getUploadedFiles } = require('../../app/services/excel.service');
// const Files = require('./Files');
const dB = require('../../app/models');
const ExcelServices = require('../../app/services/excel.service');

// Mock dependencies
jest.mock('../../app/models');
// jest.mock('../../app/services/excel.service');


describe('getUploadedFiles', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('should return a list of uploaded files', async () => {
        const files = [
            { fileName: 'file1.xlsx', createdAt: '2022-01-01' },
            { fileName: 'file2.xlsx', createdAt: '2022-01-02' }
        ];

        dB.files.findAll.mockResolvedValueOnce(files);

        const result = await ExcelServices.getUploadedFiles();
        console.log("Result: ", result);
        expect(dB.files.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(files);
    });

    test('should return an empty array when no files found', async () => {
        dB.files.findAll.mockResolvedValueOnce([]);

        const result = await getUploadedFiles();

        expect(dB.files.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);
    });

    test('should reject with an error message when an error occurs', async () => {
        const errorMessage = 'Failed to fetch uploaded files';
        const error = new Error(errorMessage);

        dB.files.findAll.mockRejectedValueOnce(error);

        await expect(getUploadedFiles()).rejects.toEqual({ message: errorMessage });
        expect(dB.files.findAll).toHaveBeenCalledTimes(1);
    });
});