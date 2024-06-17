const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    otp: {
      type: DataTypes.STRING('10'),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    assign_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_agree: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    instagram_uri: {
      type: DataTypes.STRING,
      allowNull: true
    },
    facebook_uri: {
      type: DataTypes.STRING,
      allowNull: true
    },
    youtube_uri: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ticktok_uri: {
      type: DataTypes.STRING,
      allowNull: true
    },
    other: {
      type: DataTypes.STRING,
      allowNull: true
    },
    about_yourself: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hear_about_us: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
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
  }, {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
});

User.associate = function(models) {
  User.belongsTo(models.Role, { foreignKey: 'role_id' });

  User.hasMany(models.User_meta, { foreignKey: 'user_id' });
};

module.exports = User;