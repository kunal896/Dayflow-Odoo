import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('dayflow_user') || 'null');
  function logout() { localStorage.removeItem('dayflow_token'); localStorage.removeItem('dayflow_user'); navigate('/login'); }
  return <nav style={{display:'flex',gap:16,padding:16,borderBottom:'1px solid #ddd'}}>
    <strong>Dayflow</strong><Link to="/">Dashboard</Link><Link to="/profile">Profile</Link><Link to="/attendance">Attendance</Link><Link to="/leave">Leave</Link><Link to="/payroll">Payroll</Link>
    {user?.role === 'admin' && <Link to="/admin">Admin</Link>}<span style={{marginLeft:'auto'}}>{user?.name}</span><button onClick={logout}>Logout</button>
  </nav>;
}
