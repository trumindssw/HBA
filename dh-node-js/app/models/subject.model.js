module.exports = (sequelize, Sequelize) => {
    const Subject = sequelize.define("subjects", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      registrationNumber: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      universityID: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      universityName: {
        type: Sequelize.STRING
      },
      degreeName: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      yearOfPassing: {
        type: Sequelize.STRING
      },
      startDate: {
        type: Sequelize.STRING
      },
      endDate: {
        type: Sequelize.STRING
      }
    });
  
    return Subject;
  };