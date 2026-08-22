const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  checkInTime: { type: DataTypes.DATE, allowNull: true },
  checkOutTime: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('present', 'absent', 'half-day', 'leave'), allowNull: false, defaultValue: 'present' },
}, { tableName: 'Attendances', indexes: [{ unique: true, fields: ['userId', 'date'] }] });

module.exports = Attendance;
