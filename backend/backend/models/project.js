'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // Ensure that models.User is used to reference the User model
      Project.belongsToMany(models.User, { through: 'UserProjects', foreignKey: 'projectId', otherKey: 'userId' });
    }
  }

  Project.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Project',
  });

  return Project;
};