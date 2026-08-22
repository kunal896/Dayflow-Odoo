import { Navigate } from 'react-router-dom';
import EmployeeDashboard from './EmployeeDashboard';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('dayflow_user') || 'null');
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <EmployeeDashboard />;
}
