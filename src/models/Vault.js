const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vault = sequelize.define('Vault', {
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
  content_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content_type: {
    type: DataTypes.STRING,
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

Vault.associate = function(models) {
  Vault.belongsTo(models.User, { foreignKey: 'user_id' });
  Vault.belongsTo(models.Image, { foreignKey: 'content_id' });
};

module.exports = Vault;
