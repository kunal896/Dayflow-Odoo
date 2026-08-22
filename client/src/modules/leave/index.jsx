import EmployeeLeaveView from './EmployeeLeaveView';
import AdminLeaveView from './AdminLeaveView';

export default function LeavePage() {
  const user = JSON.parse(localStorage.getItem('dayflow_user') || 'null');
  return user?.role === 'admin' ? <AdminLeaveView /> : <EmployeeLeaveView />;
}
