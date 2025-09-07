const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');
const bcrypt = require('bcrypt');
const config = require('../config/config');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 20],
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 128]
        }
    },
    region: {
        type: DataTypes.ENUM('asia', 'russia', 'europe', 'usa', 'brazil', 'australia'),
        allowNull: false
    },
    elo: {
        type: DataTypes.INTEGER,
        defaultValue: 250,
        validate: {
            min: 100,
            max: 3000
        }
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 10
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['username'] },
        { unique: true, fields: ['email'] },
        { fields: ['elo'] },
        { fields: ['region'] }
    ]
});

// Хеширование пароля перед сохранением
User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, config.ENCRYPTION.PASSWORD_SALT_ROUNDS);
});

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, config.ENCRYPTION.PASSWORD_SALT_ROUNDS);
    }
});

// Метод проверки пароля
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = User;