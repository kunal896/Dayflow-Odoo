import React from 'react';
import EmployeeAttendance from './EmployeeAttendance';
import AdminAttendance from './AdminAttendance';

export default function AttendancePage() {
  let user = null;
  try {
    const storedUser = localStorage.getItem('dayflow_user');
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error('Failed to read dayflow_user from localStorage:', err);
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {isAdmin ? <AdminAttendance /> : <EmployeeAttendance />}
    </div>
  );
}
