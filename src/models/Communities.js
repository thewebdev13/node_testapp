const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Communities = sequelize.define('Communities', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  image: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fans: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  age: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
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

Communities.associate = function(models) {
  Communities.belongsToMany(models.User, {
    through: models.Community_users,
    foreignKey: 'community_id',
    otherKey: 'user_id'
  });
  Communities.belongsTo(models.Image, { foreignKey: 'image' });
  Communities.belongsTo(models.User, { as: 'Creator', foreignKey: 'created_by' });
};

module.exports = Communities;
