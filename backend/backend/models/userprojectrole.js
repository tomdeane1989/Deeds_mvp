'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProjectRole extends Model {
    static associate(models) {
      // UserProjectRole connects Users and Projects with specific roles
      UserProjectRole.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'  // Alias for user association
      });
      UserProjectRole.belongsTo(models.Project, {
        foreignKey: 'projectId',
        as: 'project'  // Alias for project association
      });
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
        isIn: [['Admin', 'Buyer', 'Seller', 'Agent', 'Solicitor', 'Mortgage Advisor']]  // Ensure valid roles
      }
    }
  }, {
    sequelize,
    modelName: 'UserProjectRole',
  });

  return UserProjectRole;
};