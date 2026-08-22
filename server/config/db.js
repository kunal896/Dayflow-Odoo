const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'sqlite';

const sequelize = dialect === 'sqlite'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'),
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'dayflow',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        logging: false,
      }
    );

module.exports = sequelize;

