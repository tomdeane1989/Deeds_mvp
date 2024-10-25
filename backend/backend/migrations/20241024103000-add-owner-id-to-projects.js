'use strict';


module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add ownerId as nullable first
    await queryInterface.addColumn('Projects', 'ownerId', {
      type: Sequelize.INTEGER,
      allowNull: true,  // Allow nulls initially
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Projects', 'ownerId');
  }
};