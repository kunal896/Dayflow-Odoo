import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminLeaveView() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [openCommentId, setOpenCommentId] = useState(null);
  const [decidingId, setDecidingId] = useState(null);

  async function loadLeaves() {
    try {
      const { data } = await api.get('/leave/all');
      setLeaves(data.data);
    } catch {
      // error toast already shown by the shared axios interceptor
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLeaves(); }, []);

  async function decide(id, status) {
    const adminComment = commentDrafts[id] || '';
    setDecidingId(id);
    try {
      const { data } = await api.put(`/leave/${id}/decision`, { status, adminComment });
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, ...data.data } : l)));
      toast.success(`Leave request ${status}`);
      setOpenCommentId(null);
    } catch {
      // error toast already shown
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <section>
      <h1>Leave requests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : leaves.length === 0 ? (
        <p>No leave requests.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: 8 }}>Employee</th>
              <th style={{ padding: 8 }}>Type</th>
              <th style={{ padding: 8 }}>Start</th>
              <th style={{ padding: 8 }}>End</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{l.User?.name} ({l.User?.employeeId})</td>
                <td style={{ padding: 8, textTransform: 'capitalize' }}>{l.leaveType}</td>
                <td style={{ padding: 8 }}>{l.startDate}</td>
                <td style={{ padding: 8 }}>{l.endDate}</td>
                <td style={{ padding: 8, textTransform: 'capitalize' }}>{l.status}</td>
                <td style={{ padding: 8 }}>
                  {l.status !== 'pending' ? (
                    <span style={{ color: '#777' }}>{l.adminComment || '—'}</span>
                  ) : openCommentId === l.id ? (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        placeholder="Comment (optional)"
                        value={commentDrafts[l.id] || ''}
                        onChange={(e) => setCommentDrafts({ ...commentDrafts, [l.id]: e.target.value })}
                      />
                      <button onClick={() => decide(l.id, 'approved')} disabled={decidingId === l.id} type="button">Approve</button>
                      <button onClick={() => decide(l.id, 'rejected')} disabled={decidingId === l.id} type="button">Reject</button>
                      <button onClick={() => setOpenCommentId(null)} type="button">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setOpenCommentId(l.id)} type="button">Review</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
