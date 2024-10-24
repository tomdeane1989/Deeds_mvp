'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // Association with Users (owner of the project)
      Project.belongsTo(models.User, { as: 'owner', foreignKey: 'ownerId' });

      // Association for collaborators
      Project.belongsToMany(models.User, { through: 'UserProjects', foreignKey: 'projectId', otherKey: 'userId', as: 'collaborators' });
    }
  }

  Project.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',  // Referencing the User model for owner
        key: 'id'
      },
      onDelete: 'CASCADE'  // If the owner is deleted, the project will be deleted as well
    }
  }, {
    sequelize,
    modelName: 'Project',
  });

  return Project;
};