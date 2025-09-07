const { Sequelize } = require('sequelize');
const config = require('../backend/config/config');

// Создание подключения к базе данных
const sequelize = new Sequelize(
    config.DATABASE.NAME,
    config.DATABASE.USER,
    config.DATABASE.PASSWORD,
    {
        host: config.DATABASE.HOST,
        port: config.DATABASE.PORT,
        dialect: 'postgres',
        ssl: config.DATABASE.SSL,
        pool: {
            max: config.DATABASE.POOL.MAX,
            min: config.DATABASE.POOL.MIN,
            acquire: config.DATABASE.POOL.ACQUIRE_TIMEOUT,
            idle: config.DATABASE.POOL.IDLE_TIMEOUT
        },
        logging: false // Отключаем SQL логи
    }
);

// Проверка подключения
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Подключение к базе данных успешно');
        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения к базе данных:', error);
        return false;
    }
}

module.exports = { sequelize, testConnection };