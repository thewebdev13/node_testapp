const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invitation = sequelize.define('Invitation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    invite_by: {
      type: DataTypes.STRING,
      allowNull: false
    },
    invite_to: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

module.exports = Invitation;
