const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Role = require('./Role');
db.User = require('./User');
db.User_meta = require('./User_meta');
db.Vault = require('./Vault');
db.Image = require('./Image');
db.Communities = require('./Communities');
db.Community_users = require('./Community_users');

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
