module.exports = (sequelize, Sequelize) => {
    const Request = sequelize.define("requess", {
      requestID: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      subjectName: {
        type: Sequelize.STRING
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