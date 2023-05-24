const { QueryTypes } = require('sequelize');
const dB = require('../../app/models');
const { getRequestCounts } = require('../../app/services/request.service');

// Mock dependencies
jest.mock('../../app/models');


describe('getRequestCounts', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should resolve with count data when successful', async () => {
    // Mock the expected response from the database
    const mockCountRes = [
      {
        avgReqPerDay: 10,
        avgReqPerWeek: 50,
        totalReq: 100,
        totalReqWithSubjectFound: 80,
        totalReqWithMismatch: 20,
      },
    ];

    const mockCountResvsLastWeek = [
      {
        avgVsLastWeekPerc: '10',
        totalReqWithSubjectFoundvsLastWeek: '20',
        totalReqWithMismatchvsLastWeek: '30',
      },
    ];

    // Mock the sequelize query method to return the expected values
    dB.requests.sequelize.query.mockResolvedValueOnce(mockCountRes);
    dB.requests.sequelize.query.mockResolvedValueOnce(mockCountResvsLastWeek);

    // Call the getRequestCounts function
    const result = await getRequestCounts();

    // Assertions
    expect(dB.requests.sequelize.query).toHaveBeenCalledTimes(2);
    expect(dB.requests.sequelize.query).toHaveBeenCalledWith(expect.any(String), { type: expect.anything() });
    expect(result).toEqual({
      avgReqPerDay: 10,
      avgReqPerWeek: 50,
      totalReq: 100,
      totalReqWithSubjectFound: 80,
      totalReqWithMismatch: 20,
      avgReqPerDayvsLastWeek: '10',
      avgReqPerWeekvsLastWeek: '10',
      totalReqvsLastWeek: '10',
      totalReqWithSubjectFoundvsLastWeek: '20',
      totalReqWithMismatchvsLastWeek: '30',
    });
  });

  test('should reject with an error if an error occurs', async () => {
        const expectedError = new Error('Database error');
    
        // Mock the sequelize.query function to throw an error
        dB.requests.sequelize.query.mockRejectedValue(expectedError);
    
        await expect(getRequestCounts()).rejects.toThrow(expectedError);
      });
});

