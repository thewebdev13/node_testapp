const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule_messages = sequelize.define('Schedule_messages', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    schedule_date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    schedule_time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_sent: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
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

module.exports = Schedule_messages;
