'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Association with Projects as collaborators (through UserProjectRole)
      User.belongsToMany(models.Project, {
        through: models.UserProjectRole,
        foreignKey: 'userId',
        otherKey: 'projectId',
        as: 'collaborations'  // Alias for projects the user collaborates on
      });

      // Association for owning projects
      User.hasMany(models.Project, {
        foreignKey: 'ownerId',
        as: 'ownedProjects'  // Alias for projects the user owns
      });
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
      validate: {
        isIn: [['Private', 'Professional']]  // Allowed roles during registration
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};