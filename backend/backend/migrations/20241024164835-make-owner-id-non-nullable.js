'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make ownerId non-nullable
    await queryInterface.changeColumn('Projects', 'ownerId', {
      type: Sequelize.INTEGER,
      allowNull: false,  // Set non-nullable
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback the change (make ownerId nullable again)
    await queryInterface.changeColumn('Projects', 'ownerId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};