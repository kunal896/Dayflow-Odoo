import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from './StatusBadge';

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateOnly) {
  return new Date(`${dateOnly}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminAttendance() {
  const [range, setRange] = useState('daily');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (r) => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/all', { params: { range: r } });
      setRecords(data.data.records);
    } catch {
      // interceptor already toasted the error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  return (
    <section>
      <h1>Attendance — all employees</h1>
      <p>Read-only view across the team.</p>

      <div className="btn-row">
        <button className={`btn btn-ghost${range === 'daily' ? ' active' : ''}`} onClick={() => setRange('daily')}>
          Today
        </button>
        <button className={`btn btn-ghost${range === 'weekly' ? ' active' : ''}`} onClick={() => setRange('weekly')}>
          Last 7 days
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ margin: 0 }}>Loading…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Check-out</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td className="empty-row" colSpan={6}>No records for this range.</td></tr>
              )}
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.User?.name || '—'}</td>
                  <td className="mono">{r.User?.employeeId || '—'}</td>
                  <td className="mono">{formatDate(r.date)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="mono">{formatTime(r.checkInTime)}</td>
                  <td className="mono">{formatTime(r.checkOutTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
