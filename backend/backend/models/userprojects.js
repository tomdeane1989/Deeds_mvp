'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserProjects = sequelize.define(
    'UserProjects',
    {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',  // Name of the referenced table
          key: 'id'
        },
        onDelete: 'CASCADE'  // Ensures records are deleted when associated user is deleted
      },
      projectId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Projects',  // Name of the referenced table
          key: 'id'
        },
        onDelete: 'CASCADE'  // Ensures records are deleted when associated project is deleted
      }
    },
    {
      timestamps: false  // You can disable timestamps if they are not needed for this table
    }
  );

  UserProjects.associate = function (models) {
    // Define associations here if needed
  };

  return UserProjects;
};