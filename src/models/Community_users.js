const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Community_users = sequelize.define('Community_users', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            primaryKey: true
        },
        community_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Communities',
                key: 'id'
            },
            onDelete: 'CASCADE',
            primaryKey: true
        }
    },
    {
        timestamps: false
    }
);

module.exports = Community_users;
