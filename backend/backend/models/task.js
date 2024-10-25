'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    'Task',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.STRING,
      dueDate: DataTypes.DATE,
      status: DataTypes.STRING,
      milestoneId: DataTypes.INTEGER,  // Associate task with milestone
      // New field to define roles that can edit the task
      editRoles: {
        type: DataTypes.ARRAY(DataTypes.STRING),  // Stores an array of roles
        allowNull: false,
        defaultValue: ['admin'],  // Default edit permission for admin
      },
      creatorId: {
        type: DataTypes.INTEGER,  // User who created the task
        allowNull: false,
      },
    },
    {}
  );

  Task.associate = function (models) {
    // Task belongs to a Milestone
    Task.belongsTo(models.Milestone, { foreignKey: 'milestoneId' });
    // Optionally keep association with User to track the task creator
    Task.belongsTo(models.User, { foreignKey: 'creatorId' });
  };

  return Task;
};