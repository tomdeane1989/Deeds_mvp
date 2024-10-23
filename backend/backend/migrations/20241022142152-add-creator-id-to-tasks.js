'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add creatorId as a nullable column
    await queryInterface.addColumn('Tasks', 'creatorId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Initially allow nulls
    });

    // Step 2: Set a default creatorId for existing rows (e.g., set to 1 or any default user ID)
    await queryInterface.sequelize.query(`
      UPDATE "Tasks" 
      SET "creatorId" = 1  -- You can replace 1 with an actual existing user ID
      WHERE "creatorId" IS NULL;
    `);

    // Step 3: Alter the column to make it non-nullable
    await queryInterface.changeColumn('Tasks', 'creatorId', {
      type: Sequelize.INTEGER,
      allowNull: false, // Now set to NOT NULL
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'creatorId');
  },
};