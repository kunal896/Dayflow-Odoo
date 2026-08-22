import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const LEAVE_TYPES = ['paid', 'sick', 'unpaid'];
const STATUS_COLORS = { pending: '#b58900', approved: '#1a7f37', rejected: '#c0392b' };

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#555';
  return (
    <span style={{ color, border: `1px solid ${color}`, borderRadius: 12, padding: '2px 10px', fontSize: 13, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

const emptyForm = { leaveType: 'paid', startDate: '', endDate: '', remarks: '' };

export default function EmployeeLeaveView() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  async function loadLeaves() {
    try {
      const { data } = await api.get('/leave/me');
      setLeaves(data.data);
    } catch {
      // error toast already shown by the shared axios interceptor
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLeaves(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return toast.error('Start and end date are required');
    if (form.endDate < form.startDate) return toast.error('End date must be on or after start date');

    setSubmitting(true);
    try {
      await api.post('/leave/apply', form);
      toast.success('Leave request submitted');
      setForm(emptyForm);
      loadLeaves();
    } catch {
      // error toast already shown
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Leave</h1>

      <form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 420, marginBottom: 32 }}>
        <label>
          Leave type
          <select
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            style={{ display: 'block', width: '100%' }}
          >
            {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ flex: 1 }}>
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              style={{ display: 'block', width: '100%' }}
              required
            />
          </label>
          <label style={{ flex: 1 }}>
            End date
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              style={{ display: 'block', width: '100%' }}
              required
            />
          </label>
        </div>

        <label>
          Remarks
          <textarea
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            rows={3}
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        <button disabled={submitting}>{submitting ? 'Submitting...' : 'Apply for Leave'}</button>
      </form>

      <h2>My requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : leaves.length === 0 ? (
        <p>No leave requests yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: 8 }}>Type</th>
              <th style={{ padding: 8 }}>Start</th>
              <th style={{ padding: 8 }}>End</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Admin comment</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8, textTransform: 'capitalize' }}>{l.leaveType}</td>
                <td style={{ padding: 8 }}>{l.startDate}</td>
                <td style={{ padding: 8 }}>{l.endDate}</td>
                <td style={{ padding: 8 }}><StatusBadge status={l.status} /></td>
                <td style={{ padding: 8 }}>{l.status === 'pending' ? '—' : (l.adminComment || '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
