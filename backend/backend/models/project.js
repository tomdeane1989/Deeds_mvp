'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // Association with Users for project ownership
      Project.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner'  // Alias for project owner
      });

      // Association with Users as collaborators (through UserProjectRole)
      Project.belongsToMany(models.User, {
        through: models.UserProjectRole,  // Link via UserProjectRole for role-based collaboration
        foreignKey: 'projectId',
        otherKey: 'userId',
        as: 'collaborators'  // Alias for users collaborating on this project
      });
    }
  }

  Project.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'  // Ensures deletion if owner is deleted
    }
  }, {
    sequelize,
    modelName: 'Project',
  });

  return Project;
};