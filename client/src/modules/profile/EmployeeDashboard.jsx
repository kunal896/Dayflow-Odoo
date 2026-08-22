import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function currentUser() {
  return JSON.parse(localStorage.getItem('dayflow_user') || 'null');
}

// Attendance/Leave endpoints are being built in parallel on other branches. Until they're
// merged, calls to them will 404 or fail — treat that as an empty state, not a crash.
function useSafeGet(url) {
  const [state, setState] = useState({ loading: true, data: null, available: true });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(url);
        if (!cancelled) setState({ loading: false, data: data.data, available: true });
      } catch {
        if (!cancelled) setState({ loading: false, data: null, available: false });
      }
    })();
    return () => { cancelled = true; };
  }, [url]);
  return state;
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = currentUser();
  const attendance = useSafeGet('/attendance/me?range=daily');
  const leave = useSafeGet('/leave/me');

  function logout() {
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
    navigate('/login');
  }

  return (
    <section>
      <h1>Welcome, {user?.name?.split(' ')[0] || 'there'}</h1>

      <div className="quick-grid">
        <Link to="/profile" className="quick-card">
          <strong>Profile</strong>
          <span>View and edit your details</span>
        </Link>
        <Link to="/attendance" className="quick-card">
          <strong>Attendance</strong>
          <span>Check in / check out</span>
        </Link>
        <Link to="/leave" className="quick-card">
          <strong>Leave Requests</strong>
          <span>Apply and track leave</span>
        </Link>
        <button className="quick-card" onClick={logout} style={{ textAlign: 'left', border: '1px solid #ddd' }}>
          <strong>Logout</strong>
          <span>End your session</span>
        </button>
      </div>

      <div className="card">
        <h2>Recent activity</h2>

        <h3 style={{ marginBottom: 4 }}>Today's attendance</h3>
        {attendance.loading ? (
          <p>Loading…</p>
        ) : !attendance.available ? (
          <p style={{ color: '#888' }}>Attendance module isn't available yet.</p>
        ) : attendance.data?.records?.length ? (
          <ul>
            {attendance.data.records.map((r) => (
              <li key={r.id || r.date}>{r.date}: {r.status} {r.checkInTime ? `(in ${new Date(r.checkInTime).toLocaleTimeString()})` : ''}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#888' }}>No attendance recorded yet today.</p>
        )}

        <h3 style={{ marginBottom: 4 }}>Recent leave requests</h3>
        {leave.loading ? (
          <p>Loading…</p>
        ) : !leave.available ? (
          <p style={{ color: '#888' }}>Leave module isn't available yet.</p>
        ) : leave.data?.requests?.length ? (
          <ul>
            {leave.data.requests.slice(0, 5).map((l) => (
              <li key={l.id}>{l.leaveType} · {l.startDate} → {l.endDate} · {l.status}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#888' }}>No leave requests yet.</p>
        )}
      </div>
    </section>
  );
}
