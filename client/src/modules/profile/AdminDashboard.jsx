import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ReportsTab from './ReportsTab';

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

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState(false);

  const attendance = useSafeGet('/attendance/all?range=daily');
  const leave = useSafeGet('/leave/all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/profile/all');
        if (!cancelled) setEmployees(data.data.users);
      } catch {
        if (!cancelled) setEmployeesError(true);
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pendingLeaveCount = leave.available
    ? (leave.data?.requests || []).filter((l) => l.status === 'pending').length
    : null;

  return (
    <section>
      <h1>Admin Dashboard</h1>

      <div className="tab-bar">
        <button className={tab === 'overview' ? 'tab active' : 'tab'} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'reports' ? 'tab active' : 'tab'} onClick={() => setTab('reports')}>Reports</button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="quick-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="card" style={{ margin: 0 }}>
              <h3 style={{ margin: 0 }}>Employees</h3>
              <p style={{ fontSize: 28, margin: '8px 0 0' }}>{loadingEmployees ? '…' : employees.length}</p>
            </div>
            <div className="card" style={{ margin: 0 }}>
              <h3 style={{ margin: 0 }}>Checked in today</h3>
              <p style={{ fontSize: 28, margin: '8px 0 0' }}>
                {!attendance.available ? 'n/a' : (attendance.data?.records || []).filter((r) => r.status === 'present').length}
              </p>
            </div>
            <div className="card" style={{ margin: 0 }}>
              <h3 style={{ margin: 0 }}>Pending leave requests</h3>
              <p style={{ fontSize: 28, margin: '8px 0 0' }}>{pendingLeaveCount ?? 'n/a'}</p>
            </div>
          </div>

          <div className="card">
            <h2>Employees</h2>
            {loadingEmployees ? (
              <p>Loading…</p>
            ) : employeesError ? (
              <p style={{ color: '#888' }}>Could not load the employee list.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Employee ID</th><th>Job title</th><th>Role</th><th></th></tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.employeeId}</td>
                      <td>{emp.jobTitle || '—'}</td>
                      <td>{emp.role}</td>
                      <td><Link to={`/profile/${emp.id}`}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2>Recent leave requests</h2>
            {leave.loading ? (
              <p>Loading…</p>
            ) : !leave.available ? (
              <p style={{ color: '#888' }}>Leave module isn't available yet.</p>
            ) : (leave.data?.requests || []).length ? (
              <table className="table">
                <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
                <tbody>
                  {(leave.data.requests || []).slice(0, 8).map((l) => (
                    <tr key={l.id}>
                      <td>{employees.find((e) => e.id === l.userId)?.name || l.userId}</td>
                      <td>{l.leaveType}</td>
                      <td>{l.startDate} → {l.endDate}</td>
                      <td>{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#888' }}>No leave requests yet.</p>
            )}
          </div>
        </>
      )}

      {tab === 'reports' && <ReportsTab employees={employees} />}
    </section>
  );
}
