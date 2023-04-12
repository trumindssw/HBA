module.exports = (sequelize, Sequelize) => {
    const Subject = sequelize.define("subjects", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      regNumber: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      middleName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING
      },
      issuingAuthority: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      department: {
        type: Sequelize.STRING,
      },
      document: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      startDate: {
        type: Sequelize.DATE
      },
      endDate: {
        type: Sequelize.DATE
      }
    });
  
    return Subject;
  };