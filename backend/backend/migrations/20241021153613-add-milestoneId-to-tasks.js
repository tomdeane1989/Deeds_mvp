
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'milestoneId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Milestones',  // Name of the referenced table
        key: 'id',            // Key in the referenced table
      },
      allowNull: true,         // Allow null values if a task is not tied to a milestone
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'milestoneId');
  },
};