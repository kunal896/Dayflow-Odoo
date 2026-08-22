require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Attendance, LeaveRequest, Payroll } = require('./models');

(async () => {
  await sequelize.sync({ alter: true });
  await Attendance.destroy({ where: {} });
  await LeaveRequest.destroy({ where: {} });
  await Payroll.destroy({ where: {} });
  await User.destroy({ where: {} });

  const passwordHash = await bcrypt.hash('Test1234', 10);
  const users = await User.bulkCreate([
    { employeeId: 'EMP001', name: 'Admin User', email: 'admin@dayflow.test', passwordHash, role: 'admin', phone: '9999999999', address: 'Bengaluru', jobTitle: 'HR Administrator', salaryBase: 90000, isEmailVerified: true },
    { employeeId: 'EMP002', name: 'Aarav Sharma', email: 'aarav@dayflow.test', passwordHash, role: 'employee', phone: '9888888888', address: 'Bengaluru', jobTitle: 'Software Engineer', salaryBase: 60000, isEmailVerified: true },
    { employeeId: 'EMP003', name: 'Diya Rao', email: 'diya@dayflow.test', passwordHash, role: 'employee', phone: '9777777777', address: 'Mysuru', jobTitle: 'UI Designer', salaryBase: 55000, isEmailVerified: true },
    { employeeId: 'EMP004', name: 'Kabir Shah', email: 'kabir@dayflow.test', passwordHash, role: 'employee', phone: '9666666666', address: 'Bengaluru', jobTitle: 'QA Engineer', salaryBase: 52000, isEmailVerified: true }
  ]);
  await Attendance.bulkCreate([{ userId: users[1].id, date: '2026-08-21', status: 'present', checkInTime: new Date('2026-08-21T09:10:00'), checkOutTime: new Date('2026-08-21T18:05:00') }]);
  await LeaveRequest.bulkCreate([{ userId: users[2].id, leaveType: 'paid', startDate: '2026-08-25', endDate: '2026-08-26', remarks: 'Personal work', status: 'pending' }]);
  await Payroll.bulkCreate([{ userId: users[1].id, baseSalary: 60000, allowances: 5000, deductions: 2000, netSalary: 63000, month: 8, year: 2026 }]);
  console.log('Seed complete. Password for all users: Test1234');
  await sequelize.close();
})().catch(err => { console.error(err); process.exit(1); });
