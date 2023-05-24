const dB = require('../../app/models');
const { getAllRequests } = require('../../app/services/request.service');
const { Op } = require('sequelize');
const Sequelize = require("sequelize");
// Mock dependencies
// jest.mock('../../app/models');
 
//const moment = require('moment');

// Mock the Request model and its methods
 jest.mock('../../app/models');



 const { getAllRequests } = require('../../app/services/request.service');
const { Op } = require('sequelize');
const moment = require('moment');
const { requests } = require('../../app/models/index'); // Import the Request model

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
    const requests = [
      {
        requestID: 1,
        subjectName: 'Example Request',
        createdAt: '2023-05-05',
        statusCode: 200,
        statusMessage: 'Success',
        status: 1,
      },
    ];
    const totalCount = 1;

    // Mock the Request model methods
    Request.findAll = jest.fn().mockResolvedValue(requests);
    Request.count = jest.fn().mockResolvedValue(totalCount);

    // Call the function
    const result = await getAllRequests(body);

    // Check the results
    expect(Request.findAll).toHaveBeenCalledWith({
      attributes: ['requestID', 'subjectName', 'createdAt', 'statusCode', 'statusMessage', 'status'],
      where: {
        [Op.and]: [
          { status: 1 },
          { createdAt: { [Op.gte]: expect.any(Date) } },
          { createdAt: { [Op.between]: [expect.any(Date), expect.any(Date)] } },
          {
            [Op.or]: [
              { subjectName: { [Op.iLike]: '%example%' } },
              { statusMessage: { [Op.iLike]: '%example%' } },
              { statusCode: { [Op.iLike]: '%example%' } },
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
    expect(Request.count).toHaveBeenCalledWith({
      where: {
        [Op.and]: [
          { status: 1 },
          { createdAt: { [Op.gte]: expect.any(Date) } },
          { createdAt: { [Op.between]: [expect.any(Date), expect.any(Date)] } },
          {
            [Op.or]: [
              { subjectName: { [Op.iLike]: '%example%' } },
              { statusMessage: { [Op.iLike]: '%example%' } },
              { statusCode: { [Op.iLike]: '%example%' } },
              { requestID: { [Op.iLike]: '%example%' } },
            ],
          },
        ],
      },
    });
    expect(result).toEqual({ data: requests, total: totalCount });
  });

  test('should reject with an error message if an error occurs', async () => {
    // Mock the input body for the function
    const body = {
      page: 1,
      limit: 10,
      status: 1,
    };

    // Mock the Request model methods to throw an error
    Request.findAll = jest.fn().mockRejectedValue(new Error('Database connection error'));

    // Call the function and expect it to reject with an error
    await expect(getAllRequests(body)).rejects.toEqual({
      message: 'Could not get the requests : Error: Database connection error',
    });
    expect(Request.findAll).toHaveBeenCalled();
  });
});


// describe('getAllRequests', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test('should return requests and total count if requests exist', async () => {
//     // Mock the input body for the function
//     const body = {
//       page: 1,
//       limit: 10,
//       status: 1,
//       lastWeek: false,
//       lastMonth: false,
//       startDate: '2023-05-01',
//       endDate: '2023-05-10',
//       searchValue: 'example',
//       sortKey: 'createdAt',
//       sortValue: 'DESC',
//     };

//     // Mock the expected results
//     const requests = [{ requestID: 1, subjectName: 'Example Request', createdAt: '2023-05-05', statusCode: 200, statusMessage: 'Success', status: 1 }];
//     const totalCount = 1;

//     // Mock the Request model methods
    
//     dB.requests.findAll.mockResolvedValue(requests);
//     dB.requests.count.mockResolvedValue(totalCount);

//     // Call the function
//     const result = await getAllRequests(body);

//     // Check the results
//     expect( dB.requests.findAll).toHaveBeenCalledWith({
//       attributes: ['requestID', 'subjectName', 'createdAt', 'statusCode', 'statusMessage', 'status'],
//       where: {
//         [Op.and]: [
//           { status: 1 },
//           { createdAt: { [Op.gte]: 'mocked_gte' } },
//           { createdAt: { [Op.between]: ['mocked_between', 'mocked_between'] } },
//           {
//             [Op.or]: [
//               { subjectName: { [Sequelize.Op.iLike]: '%example%' } },
//               { statusMessage: { [Sequelize.Op.iLike]: '%example%' } },
//               { statusCode: { [Sequelize.Op.iLike]: '%example%' } },
//               { requestID: { [Sequelize.Op.iLike]: '%example%' } },
//             ],
//           },
//         ],
//       },
//       order: [['createdAt', 'DESC']],
//       page: 1,
//       limit: 10,
//       offset: 0,
//     });
//     expect( dB.requests.count).toHaveBeenCalledWith({
//       where: {
//         [Op.and]: [
//           { status: 1 },
//           { createdAt: { [Op.gte]: 'mocked_gte' } },
//           { createdAt: { [Op.between]: ['mocked_between', 'mocked_between'] } },
//           {
//             [Op.or]: [
//               { subjectName: { [Sequelize.Op.iLike]: '%example%' } },
//               { statusMessage: { [Sequelize.Op.iLike]: '%example%' } },
//               { statusCode: { [Sequelize.Op.iLike]: '%example%' } },
//               { requestID: { [Sequelize.Op.iLike]: '%example%' } },
//             ],
//           },
//         ],
//       },
//     });
//     expect(result).toEqual({ data: requests, total: totalCount });
//   });

//   // test('should reject with an error message if requests do not exist', async () => {
//   //   // Mock the input body for the function
//   //   const body = {
//   //     page: 1,
//   //     limit: 10,
//   //     status: null,
//   //     lastWeek: false,
//   //     lastMonth: false,
//   //     startDate: null,
//   //     endDate: null,
//   //     searchValue: 'example',
//   //     sortKey: 'createdAt',
//   //     sortValue: 'DESC',
//   //   };

//   //   // Mock the expected error message
//   //   const errorMessage = 'There are no previous requests';

//   //   // Mock the Request model methods
//   //   dB.requests.Request.findAll.mockResolvedValue([]);
//   //   dB.requests.Request.count.mockResolvedValue(0);

//   //   // Call the function
//   //   await expect(getAllRequests(body)).rejects.toEqual({ message: errorMessage });

//   //   // Check the results
//   //   expect( dB.requests.Request.findAll).toHaveBeenCalledWith({
//   //     attributes: ['requestID', 'subjectName', 'createdAt', 'statusCode', 'statusMessage', 'status'],
//   //     where: {
//   //       [Op.and]: [
//   //         {
//   //           [Op.or]: [
//   //             { subjectName: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { statusMessage: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { statusCode: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { requestID: { [Sequelize.Op.iLike]: '%example%' } },
//   //           ],
//   //         },
//   //       ],
//   //     },
//   //     order: [['createdAt', 'DESC']],
//   //     page: 1,
//   //     limit: 10,
//   //     offset: 0,
//   //   });
//   //   expect(dB.requests.Request.count).toHaveBeenCalledWith({
//   //     where: {
//   //       [Op.and]: [
//   //         {
//   //           [Op.or]: [
//   //             { subjectName: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { statusMessage: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { statusCode: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { requestID: { [Sequelize.Op.iLike]: '%example%' } },
//   //           ],
//   //         },
//   //       ],
//   //     },
//   //   });
//   // });

//   // test('should reject with an error message if an error occurs', async () => {
//   //   // Mock the input body for the function
//   //   const body = {
//   //     page: 1,
//   //     limit: 10,
//   //     status: 1,
//   //     lastWeek: false,
//   //     lastMonth: false,
//   //     startDate: null,
//   //     endDate: null,
//   //     searchValue: 'example',
//   //     sortKey: 'createdAt',
//   //     sortValue: 'DESC',
//   //   };

//   //   // Mock the error message
//   //   const errorMessage = 'Could not get the requests: Internal Server Error';

//   //   // Mock the Request model methods
//   //   dB.requests.Request.findAll.mockRejectedValue(new Error('Internal Server Error'));
//   //   dB.requests.Request.count.mockResolvedValue(0);

//   //   // Call the function
//   //   await expect(getAllRequests(body)).rejects.toEqual({ message: errorMessage });

//   //   // Check the results
//   //   expect( dB.requests.Request.findAll).toHaveBeenCalledWith({
//   //     attributes: ['requestID', 'subjectName', 'createdAt', 'statusCode', 'statusMessage', 'status'],
//   //     where: {
//   //       [Op.and]: [
//   //         { status: 1 },
//   //         {
//   //           [Op.or]: [
//   //             { subjectName: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { statusMessage: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { statusCode: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { requestID: { [Sequelize.Op.iLike]: '%example%' } },
//   //           ],
//   //         },
//   //       ],
//   //     },
//   //     order: [['createdAt', 'DESC']],
//   //     page: 1,
//   //     limit: 10,
//   //     offset: 0,
//   //   });
//   //   expect(dB.requests.Request.count).toHaveBeenCalledWith({
//   //     where: {
//   //       [Op.and]: [
//   //         { status: 1 },
//   //         {
//   //           [Op.or]: [
//   //             { subjectName: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { statusMessage: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { statusCode: { [Sequelize.Op.iLike]: '%example%' } },
//   //             { requestID: { [Sequelize.Op.iLike]: '%example%' } },
//   //           ],
//   //         },
//   //       ],
//   //     },
//   //   });
//   // });
// });
