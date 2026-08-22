import { Link, useLocation, useNavigate } from 'react-router-dom';

const LINKS = [
  ['/', 'Dashboard'],
  ['/profile', 'Profile'],
  ['/attendance', 'Attendance'],
  ['/leave', 'Leave'],
  ['/payroll', 'Payroll'],
];

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem('dayflow_user') || 'null');

  function logout() {
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
    navigate('/login');
  }

  return (
    <nav className="topbar">
      <div className="brand">
        <span className="ticks">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={i === 3 ? 'on' : ''} />
          ))}
        </span>
        Dayflow
      </div>

      <div className="nav-links">
        {LINKS.map(([to, label]) => (
          <Link key={to} to={to} className={`nav-link${pathname === to ? ' active' : ''}`}>
            {label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link to="/admin" className={`nav-link${pathname === '/admin' ? ' active' : ''}`}>
            Admin
          </Link>
        )}
      </div>

      <div className="topbar-right">
        <span className="user-name">{user?.name}</span>
        <button className="btn btn-ghost" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
