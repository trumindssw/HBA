const { upload } = require('../../app/services/excel.service'); // Replace 'your-file.js' with the actual file path
const xlsx = require('xlsx')
const { validateRowData, getMissingFields, validateHeaders, isValidDate } = require('../../app/helpers/excel.helper');
jest.mock('../../app/helpers/excel.helper');
// Mock dependencies and setup test data
const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

const fileMock = {
    originalname: 'test.xlsx',
    buffer: 'mocked buffer'
};

const FilesMock = {
    create: jest.fn()
};

const SubjectMock = {
    bulkCreate: jest.fn()
};

const ExcelServicesMock = {
    getUploadedFiles: jest.fn().mockResolvedValue([])
};

describe('upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should reject with an error message if file is undefined', async () => {
        await expect(upload(undefined)).rejects.toEqual({ message: 'Please upload a valid excel file (.xls, .xlsx)' });
    });

    it('should reject with an error message if headers mismatch', async () => {
        const invalidHeadersFileMock = {
            originalname: '../helpers/header-mismatch.xlsx',
            buffer: 'mocked buffer'
        };
        const validateHeadersMock = validateHeaders.mockReturnValue(false);
        // console.log(validateHeadersMock);

        await expect(upload(invalidHeadersFileMock)).rejects.toEqual({
            message: 'Error - Headers mismatch Sample File Format. Please check and re-upload.'
        });
        // expect(loggerMock.error).toHaveBeenCalledWith('Headers mismatch Sample File Format');
        expect(validateHeadersMock).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should reject with an error message if data is empty', async () => {
        const emptyDataFileMock = {
            originalname: '../helpers/empty-data.xlsx',
            buffer: Buffer.from('')
        };
        const sheetDataMock = [];
        const validateHeadersMock = jest.fn().mockReturnValue(false);
        console.log(validateHeadersMock);
        const sheetToJsonMock = jest.fn().mockReturnValue(sheetDataMock);
        const readMock = jest.spyOn(xlsx, 'read').mockReturnValue({ Sheets: { Sheet1: {} }, SheetNames: ['Sheet1'] });
        const validateRowDataMock = jest.fn().mockReturnValue(true);
        const isValidDateMock = jest.fn().mockReturnValue(true);
        console.log("HIHIHIHI")
        // console.log(await upload(emptyDataFileMock));

        await expect(upload(emptyDataFileMock)).rejects.toEqual({ message: 'Error - File is empty!' });
        // expect(loggerMock.error).toHaveBeenCalledWith('File is empty');
        expect(validateHeadersMock).toHaveBeenCalledWith(expect.any(Array));
        expect(readMock).toHaveBeenCalledWith('mocked buffer', { type: 'buffer' });
        expect(sheetToJsonMock).toHaveBeenCalledWith({}, { header: 1 });
        expect(validateRowDataMock).not.toHaveBeenCalled();
        expect(isValidDateMock).not.toHaveBeenCalled();
    });

    it('should reject with an error message if row data is invalid', async () => {
        const invalidRowDataFileMock = {
            originalname: 'invalid-row-data.xlsx',
            buffer: 'mocked buffer'
        };
        const sheetDataMock = [['header1', 'header2'], [1, ''], [2, 'John Doe']];
        const validateHeadersMock = jest.fn().mockReturnValue(true);
        const sheetToJsonMock = jest.fn().mockReturnValue(sheetDataMock);
        const readMock = jest.spyOn(xlsx, 'read').mockReturnValue({ Sheets: { Sheet1: {} }, SheetNames: ['Sheet1'] });
        const validateRowDataMock = jest.fn().mockReturnValueOnce(false).mockReturnValue(true);
        const getMissingFieldsMock = jest.fn().mockReturnValue(['firstName']);
        const isValidDateMock = jest.fn().mockReturnValue(true);

        await expect(upload(invalidRowDataFileMock)).rejects.toEqual({
            message: [
                'Error - Row 1 : firstName is missing. Please check and re-upload.',
                'Error - Row 1 : Start Date greater than End Date. Please check and re-upload.'
            ]
        });
        expect(loggerMock.info).toHaveBeenCalledWith('Row 1: Missing Fields ::: firstName');
        expect(loggerMock.info).toHaveBeenCalledWith('Row 1: startDate > endDate');
        expect(validateHeadersMock).toHaveBeenCalledWith(expect.any(Array));
        expect(readMock).toHaveBeenCalledWith('mocked buffer', { type: 'buffer' });
        expect(sheetToJsonMock).toHaveBeenCalledWith({}, { header: 1 });
        expect(validateRowDataMock).toHaveBeenCalledTimes(2);
        expect(getMissingFieldsMock).toHaveBeenCalledWith([1, '']);
        expect(isValidDateMock).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should resolve with success message and insert data into the database', async () => {
        const validDataFileMock = {
            originalname: '../helpers/valid-data.xlsx',
            buffer: 'mocked buffer 2'
        };
        const sheetDataMock = [[
            'regNumber',
            'firstName',
            'middleName',
            'lastName',
            'issuingAuthority',
            'department',
            'document',
            'startDate',
            'endDate'
        ], [
            'S1234',
            'Shreya',
            null,
            'T V',
            'IIIT',
            'CS',
            'BTech',
            '19-05-2018',
            '19-05-2022'
        ]];
        const validateHeadersMock = validateHeaders.mockReturnValue(true);
        const sheetToJsonMock = jest.fn().mockReturnValue(sheetDataMock);
        const readMock = jest.spyOn(xlsx, 'read').mockReturnValue({ Sheets: { Sheet1: {} }, SheetNames: ['Sheet1'] });
        console.log(readMock);
        const validateRowDataMock = jest.fn().mockReturnValue(true);
        const getMissingFieldsMock = jest.fn().mockReturnValue([]);
        const isValidDateMock = jest.fn().mockReturnValue(true);

        const expectedSubjectData = [
            {
                regNumber: 'S1234',
                firstName: 'Shreya',
                middleName: null,
                lastName: 'T V',
                issuingAuthority: 'IIIT',
                department: 'CS',
                document: 'BTech',
                startDate: '19-05-2018',
                endDate: '19-05-2022'
            }
        ];

        const expectedFilename = expect.stringMatching(/^\d+-valid-data.xlsx$/);

        SubjectMock.bulkCreate.mockResolvedValue();
        FilesMock.create.mockResolvedValue();

        await expect(upload(validDataFileMock)).resolves.toEqual({
            message: 'Uploaded the file successfully: valid-data.xlsx'
        });

        expect(loggerMock.info).toHaveBeenCalledWith('Total Data Length :::1');
        expect(loggerMock.info).toHaveBeenCalledWith('Subjects Data Length :::1');
        expect(loggerMock.info).toHaveBeenCalledWith('Subject Data inserted into DB successfully.');
        expect(loggerMock.info).toHaveBeenCalledWith(`File ${expectedFilename} inserted into DB successfully.`);

        expect(validateHeadersMock).toHaveBeenCalledWith(expect.any(Array));
        expect(readMock).toHaveBeenCalledWith('mocked buffer', { type: 'buffer' });
        expect(sheetToJsonMock).toHaveBeenCalledTimes(2);
        expect(validateRowDataMock).toHaveBeenCalledWith([1, 'John', 'Doe']);
        expect(getMissingFieldsMock).toHaveBeenCalledWith([1, 'John', 'Doe']);
        expect(isValidDateMock).toHaveBeenCalledWith(undefined, undefined);

        expect(SubjectMock.bulkCreate).toHaveBeenCalledWith(expectedSubjectData, {
            updateOnDuplicate: ['firstName', 'middleName', 'lastName', 'department', 'startDate', 'endDate', 'updatedAt']
        });

        expect(FilesMock.create).toHaveBeenCalledWith({ fileName: expectedFilename, data: 'mocked buffer' });
    });

    it('should reject with an error message if data insertion fails', async () => {
        const validDataFileMock = {
            originalname: 'valid-data.xlsx',
            buffer: 'mocked buffer'
        };
        const sheetDataMock = [['regNumber', 'firstName', 'lastName'], [1, 'John', 'Doe']];
        const validateHeadersMock = jest.fn().mockReturnValue(true);
        const sheetToJsonMock = jest.fn().mockReturnValue(sheetDataMock);
        const readMock = jest.spyOn(xlsx, 'read').mockReturnValue({ Sheets: { Sheet1: {} }, SheetNames: ['Sheet1'] });
        const validateRowDataMock = jest.fn().mockReturnValue(true);
        const getMissingFieldsMock = jest.fn().mockReturnValue([]);
        const isValidDateMock = jest.fn().mockReturnValue(true);

        SubjectMock.bulkCreate.mockRejectedValue(new Error('DB insertion failed'));

        await expect(upload(validDataFileMock)).rejects.toEqual({
            message: 'Fail to import data into database!',
            error: 'DB insertion failed'
        });

        expect(loggerMock.error).toHaveBeenCalledWith('Fail to import data ::: DB insertion failed');

        expect(validateHeadersMock).toHaveBeenCalledWith(expect.any(Array));
        expect(readMock).toHaveBeenCalledWith('mocked buffer', { type: 'buffer' });
        expect(sheetToJsonMock).toHaveBeenCalledTimes(2);
        expect(validateRowDataMock).toHaveBeenCalledWith([1, 'John', 'Doe']);
        expect(getMissingFieldsMock).toHaveBeenCalledWith([1, 'John', 'Doe']);
        expect(isValidDateMock).toHaveBeenCalledWith(undefined, undefined);

        expect(SubjectMock.bulkCreate).toHaveBeenCalledWith(expect.any(Array), {
            updateOnDuplicate: ['firstName', 'middleName', 'lastName', 'department', 'startDate', 'endDate', 'updatedAt']
        });
    });
});
