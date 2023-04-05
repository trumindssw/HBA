module.exports = (sequelize, Sequelize) => {
    const Files = sequelize.define("files", {
      fileName: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.BLOB('long')
      }
    });
  
    return Files;
  };