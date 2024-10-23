'use strict';
const { Model } = require('sequelize');

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
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'buyer', 'seller', 'admin', 'agent', 'solicitor', 'mortgage_advisor']], 
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};