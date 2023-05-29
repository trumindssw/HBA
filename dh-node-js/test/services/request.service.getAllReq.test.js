const dB = require('../../app/models');
const { getAllRequests } = require('../../app/services/request.service');
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

// Mock the Request model and its methods
 jest.mock('../../app/models');



describe('getAllRequests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return requests and total count if requests exist', async () => {
    // Mock the input body for the function
    const body = {
      page: 1,
      limit: 10,
      status: 1,
      lastWeek: false,
      lastMonth: false,
      startDate: '2023-05-01',
      endDate: '2023-05-10',
      searchValue: 'example',
      sortKey: 'createdAt',
      sortValue: 'DESC',
    };

    // Mock the expected results
    const request = [
      {
        requestID: 1,
        subjectName: 'Example Request',
        createdAt: '2023-05-05',
        statusCode: 200,
        statusMessage: 'OK',
        status: 1,
      },
    ];
    const totalCount = 1;

    // Mock the Request model methods
    dB.requests.findAll = jest.fn().mockResolvedValue(request);
    dB.requests.count = jest.fn().mockResolvedValue(totalCount);

    // Call the function
    const result = await getAllRequests(body);

    // Check the results
    expect(dB.requests.findAll).toHaveBeenCalledWith({
      attributes: ['requestID', 'subjectName', 'createdAt', 'statusCode', 'statusMessage', 'status'],
      where: {
        [Op.and]: [
          { status: 1 },
          { createdAt: { [Op.between]: [expect.any(Date), expect.any(Date)] } },
          {
            [Op.or]: [
              { subjectName: { [Op.iLike]: '%example%' } },
              { statusMessage: { [Op.iLike]: '%example%' } },
              Sequelize.where(Sequelize.cast(Sequelize.col("statusCode"), 'varchar'), 'ILIKE', `%example%`),
              { requestID: { [Op.iLike]: '%example%' } },
            ],
          },
        ],
      },
      order: [['createdAt', 'DESC']],
      page: 1,
      limit: 10,
      offset: 0,
    });
    expect(dB.requests.count).toHaveBeenCalledWith({
      where: {
        [Op.and]: [
          { status: 1 },
          { createdAt: { [Op.between]: [expect.any(Date), expect.any(Date)] } },
          {
            [Op.or]: [
              { subjectName: { [Op.iLike]: '%example%' } },
              { statusMessage: { [Op.iLike]: '%example%' } },
              Sequelize.where(Sequelize.cast(Sequelize.col("statusCode"), 'varchar'), 'ILIKE', `%example%`),
              { requestID: { [Op.iLike]: '%example%' } },
            ],
          },
        ],
      },
    });
    expect(result).toEqual({ data: request, total: totalCount });
  });

  test('should reject with an error message if an error occurs', async () => {
    // Mock the input body for the function
    const body = {
      page: 1,
      limit: 10,
      status: 1,
    };

    // Mock the Request model methods to throw an error
    dB.requests.findAll = jest.fn().mockRejectedValue(new Error('Database connection error'));

    // Call the function and expect it to reject with an error
    await expect(getAllRequests(body)).rejects.toEqual({
      message: 'Could not get the requests : Error: Database connection error',
    });
    expect(dB.requests.findAll).toHaveBeenCalled();
  });
});
