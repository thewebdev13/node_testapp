const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User_meta = sequelize.define('User_meta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  meta_key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  meta_value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});


User_meta.associate = function(models) {
  User_meta.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = User_meta;