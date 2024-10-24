'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProjectRole extends Model {
    static associate(models) {
      // Associations can be defined here
    }
  }

  UserProjectRole.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projects', 
        key: 'id'
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Admin', 'Buyer', 'Seller', 'Agent', 'Solicitor', 'Mortgage Advisor']],
      }
    }
  }, {
    sequelize,
    modelName: 'UserProjectRole',
  });

  return UserProjectRole;
};