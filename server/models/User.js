const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('employee', 'admin'), allowNull: false, defaultValue: 'employee' },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  address: { type: DataTypes.STRING(255), allowNull: true },
  jobTitle: { type: DataTypes.STRING(120), allowNull: true },
  profilePicUrl: { type: DataTypes.STRING(500), allowNull: true },
  salaryBase: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  isEmailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'Users' });

module.exports = User;
