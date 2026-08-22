import EmployeePayrollView from './EmployeePayrollView';
import AdminPayrollView from './AdminPayrollView';

export default function PayrollPage() {
  const user = JSON.parse(localStorage.getItem('dayflow_user') || 'null');
  return user?.role === 'admin' ? <AdminPayrollView /> : <EmployeePayrollView />;
}
