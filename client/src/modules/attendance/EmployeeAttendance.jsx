import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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

export default function EmployeeAttendance() {
  const [view, setView] = useState('daily');
  const [today, setToday] = useState(null);
  const [week, setWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadDaily = useCallback(async () => {
    const { data } = await api.get('/attendance/me', { params: { range: 'daily' } });
    setToday(data.data.records[0] || null);
  }, []);

  const loadWeekly = useCallback(async () => {
    const { data } = await api.get('/attendance/me', { params: { range: 'weekly' } });
    setWeek(data.data.records);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadDaily(), loadWeekly()]);
      } catch {
        // interceptor already toasted
      }
      setLoading(false);
    })();
  }, [loadDaily, loadWeekly]);

  async function handleCheckIn() {
    setBusy(true);
    try {
      const { data } = await api.post('/attendance/checkin');
      setToday(data.data.record);
      toast.success('Checked in');
      loadWeekly();
    } catch {
      // interceptor already toasted the error
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setBusy(true);
    try {
      const { data } = await api.post('/attendance/checkout');
      setToday(data.data.record);
      toast.success('Checked out');
      loadWeekly();
    } catch {
      // interceptor already toasted the error
    } finally {
      setBusy(false);
    }
  }

  const canCheckIn = !today || !today.checkInTime;
  const canCheckOut = Boolean(today && today.checkInTime && !today.checkOutTime);

  if (loading) return <p>Loading attendance…</p>;

  return (
    <section>
      <h1>Attendance</h1>
      <p>Check in when you start, check out when you're done.</p>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleCheckIn} disabled={busy || !canCheckIn}>
          Check in
        </button>
        <button className="btn btn-ghost" onClick={handleCheckOut} disabled={busy || !canCheckOut}>
          Check out
        </button>
      </div>

      <div className="btn-row">
        <button className={`btn btn-ghost${view === 'daily' ? ' active' : ''}`} onClick={() => setView('daily')}>
          Daily
        </button>
        <button className={`btn btn-ghost${view === 'weekly' ? ' active' : ''}`} onClick={() => setView('weekly')}>
          Weekly
        </button>
      </div>

      <div className="card">
        {view === 'daily' ? (
          today ? (
            <table className="table">
              <tbody>
                <tr><td>Date</td><td className="mono">{formatDate(today.date)}</td></tr>
                <tr><td>Status</td><td><StatusBadge status={today.status} /></td></tr>
                <tr><td>Check-in</td><td className="mono">{formatTime(today.checkInTime)}</td></tr>
                <tr><td>Check-out</td><td className="mono">{formatTime(today.checkOutTime)}</td></tr>
              </tbody>
            </table>
          ) : (
            <p style={{ margin: 0 }}>No attendance recorded for today yet. Check in to get started.</p>
          )
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Check-out</th>
              </tr>
            </thead>
            <tbody>
              {week.length === 0 && (
                <tr><td className="empty-row" colSpan={4}>No records in the last 7 days.</td></tr>
              )}
              {week.map((r) => (
                <tr key={r.id}>
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
