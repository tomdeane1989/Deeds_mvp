'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Milestone extends Model {
    static associate(models) {
      Milestone.belongsTo(models.Project, {
        foreignKey: 'projectId',
        onDelete: 'CASCADE'
      });
    }
  }

  Milestone.init({
    title: {  // Changed from 'name' to 'title' to match your DB schema
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    projectId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Projects',
        key: 'id'
      },
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Milestone',
  });

  return Milestone;
};