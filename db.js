const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    'bot_telega_monke', // Название базы данных
    'root', // название пользователя БД
    'root', // пароль пользователя БД
    {
        host: 'master.eccff4ee-1fad-40a8-8a6e-7b3723d41f0c.c.dbaas.selcloud.ru',
        port: 5432,
        dialect: 'postgres'
    }
)