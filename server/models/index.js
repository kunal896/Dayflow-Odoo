const sequelize = require('../config/db');
const User = require('./User');
const Attendance = require('./Attendance');
const LeaveRequest = require('./LeaveRequest');
const Payroll = require('./Payroll');

User.hasMany(Attendance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(LeaveRequest, { foreignKey: 'userId', onDelete: 'CASCADE' });
LeaveRequest.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Payroll, { foreignKey: 'userId', onDelete: 'CASCADE' });
Payroll.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Attendance, LeaveRequest, Payroll };
