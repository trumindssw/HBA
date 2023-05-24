const { getRequestDetail } = require('../../app/services/request.service');

const dB = require('../../app/models');

// Mock dependencies
jest.mock('../../app/models');

const { Sequelize } = require('sequelize');


// Mock Request model and logger
// const Request = {
//   findOne: jest.fn(),
// };


describe('getRequestDetail', () => {
    beforeEach(() => {
        dB.requests.findOne.mockClear();
    });


    test('should resolve with request details when valid request ID is provided', async () => {
        const query = { reqId: 'DU100AA001' };
        const requestStatusData = {
            requestID: 'DU100AA001',
            veriflowID: 'DU100',
            subjectName: 'John Doe',
            issuingAuthority: 'XYZ Authority',
            document: 'ID Card',
            department: 'HR',
            startYear: 2020,
            endYear: 2022,
            status: 0,
        };
        dB.requests.findOne.mockResolvedValue({ dataValues: requestStatusData });
       // jest.spyOn(dB.requests, 'findOne').mockResolvedValue({ dataValues: requestStatusData });

        const result = await getRequestDetail(query);

        expect(dB.requests.findOne).toHaveBeenCalledWith({
            where: { requestID: query.reqId },
            attributes: ['requestID', 'veriflowID', 'subjectName', 'issuingAuthority', 'document', 'department',
                [Sequelize.literal('extract(YEAR FROM "startDate")'), 'startYear'],
                [Sequelize.literal('extract(YEAR FROM "endDate")'), 'endYear'], 'status'],
        });

        var expectedResult = {
            message: 'Request is...',
            data: [
                { key: 'Request ID', value: requestStatusData.requestID, checked: requestStatusData.status },
                { key: 'Veriflow ID', value: requestStatusData.veriflowID, checked: requestStatusData.status },
                { key: 'Subject Name', value: requestStatusData.subjectName, checked: requestStatusData.status },
                { key: 'Issuing Authority', value: requestStatusData.issuingAuthority, checked: requestStatusData.status },
                { key: 'Document', value: requestStatusData.document, checked: requestStatusData.status },
                { key: 'Department', value: requestStatusData.department, checked: requestStatusData.status },
                { key: 'Start Year', value: requestStatusData.startYear, checked: requestStatusData.status },
                { key: 'End Year', value: requestStatusData.endYear, checked: requestStatusData.status },
                { key: 'status', value: requestStatusData.status, checked: requestStatusData.status },
              ]
          }
        expect(result).toEqual(expectedResult);
    });

    
      test('should reject with error message when request ID is undefined or null', async () => {
        const query = {};
        const expectedResult = {
          message: 'Request ID is undefined or null',
        };

        const result = await getRequestDetail(query).catch(error => error);

        expect(result).toEqual(expectedResult);
      });


      test('should reject with error message when no request is found with the given request ID', async () => {
        const query = { reqId: '123456' };
        dB.requests.findOne.mockResolvedValue(null);
        const expectedResult = {
          message: 'There is no such request with request id : 123456',
        };

        const result = await getRequestDetail(query).catch(error => error);

        expect(dB.requests.findOne).toHaveBeenCalledWith({
          where: { requestID: query.reqId },
          attributes: ['requestID', 'veriflowID', 'subjectName', 'issuingAuthority', 'document', 'department',
            [Sequelize.literal('extract(YEAR FROM "startDate")'), 'startYear'],
            [Sequelize.literal('extract(YEAR FROM "endDate")'), 'endYear'], 'status'],
        });
        expect(result).toEqual(expectedResult);
    })
});
