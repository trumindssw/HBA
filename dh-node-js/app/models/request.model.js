module.exports = (sequelize, Sequelize) => {
    const Request = sequelize.define("request", {
      requestID: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      veriflowID: {
        type: Sequelize.STRING
      },
      subjectName: {
        type: Sequelize.STRING
      },
      issuingAuthority: {
        type: Sequelize.STRING
      },
      document: {
        type: Sequelize.STRING
      },
      department: {
        type: Sequelize.STRING
      },
      startDate: {
        type: Sequelize.DATE
      },
      endDate: {
        type: Sequelize.DATE
      },
      statusCode: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.INTEGER
      },
      statusMessage: {
        type: Sequelize.STRING
      }
    });
  
    return Request;
  };