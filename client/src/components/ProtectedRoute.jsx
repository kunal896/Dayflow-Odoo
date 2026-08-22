import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ role }) {
  const location = useLocation();
  const token = localStorage.getItem('dayflow_token');
  const user = JSON.parse(localStorage.getItem('dayflow_user') || 'null');
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
