const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payroll = sequelize.define('Payroll', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  baseSalary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  allowances: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  deductions: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  netSalary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  month: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'Payrolls', indexes: [{ unique: true, fields: ['userId', 'month', 'year'] }] });

module.exports = Payroll;
