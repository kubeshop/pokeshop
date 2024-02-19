const { Sequelize } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    return await queryInterface.createTable('pokemon', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: Sequelize.DataTypes.STRING,
      type: Sequelize.DataTypes.STRING,
      isFeatured: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      imageUrl: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.DataTypes.NOW
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
    });
  },
  down: async ({ context: queryInterface }) => {
    return await queryInterface.dropTable('pokemon');
  }
};