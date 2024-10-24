'use strict';
const { Model, DataTypes } = require('sequelize'); // Only import Model and DataTypes
const sequelize = require('../config/connection'); // Assuming you have a connection file

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Ensure that models.Project is used here to reference the Project model
      User.belongsToMany(models.Project, { through: 'UserProjects', foreignKey: 'userId', otherKey: 'projectId' });
    }
  }

  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,  // Use DataTypes instead of Sequelize
      allowNull: false,
      validate: {
        isIn: [['Private', 'Professional']] // Only these roles allowed at registration
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};