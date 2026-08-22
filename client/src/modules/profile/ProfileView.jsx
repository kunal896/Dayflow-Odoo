import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';

function currentUser() {
  return JSON.parse(localStorage.getItem('dayflow_user') || 'null');
}

export default function ProfileView() {
  const { userId } = useParams();
  const me = currentUser();
  const viewingSelf = !userId;
  const isAdmin = me?.role === 'admin';

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const url = viewingSelf ? '/profile/me' : `/profile/${userId}`;
        const { data } = await api.get(url);
        if (!cancelled) setUser(data.data.user);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId, viewingSelf]);

  if (loading) return <p>Loading profile…</p>;
  if (error || !user) return <p>Could not load this profile.</p>;

  const canEdit = viewingSelf || isAdmin;
  const editLink = viewingSelf ? '/profile/edit' : `/profile/${userId}/edit`;

  return (
    <section>
      <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <img
          src={user.profilePicUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user.name)}
          alt={user.name}
          width={80}
          height={80}
          style={{ borderRadius: '50%', objectFit: 'cover', background: '#eee' }}
        />
        <div>
          <h1 style={{ margin: 0 }}>{user.name}</h1>
          <p style={{ margin: '4px 0', color: '#666' }}>{user.jobTitle || 'No job title set'}</p>
          <span className="badge">{user.role}</span>
        </div>
        {canEdit && (
          <Link to={editLink} style={{ marginLeft: 'auto' }}>
            <button>Edit profile</button>
          </Link>
        )}
      </div>

      <div className="card">
        <h2>Personal details</h2>
        <dl className="detail-grid">
          <dt>Employee ID</dt><dd>{user.employeeId}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Phone</dt><dd>{user.phone || '—'}</dd>
          <dt>Address</dt><dd>{user.address || '—'}</dd>
          <dt>Email verified</dt><dd>{user.isEmailVerified ? 'Yes' : 'No'}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Job details</h2>
        <dl className="detail-grid">
          <dt>Job title</dt><dd>{user.jobTitle || '—'}</dd>
          <dt>Role</dt><dd>{user.role}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Salary structure</h2>
        <p style={{ color: '#666', fontSize: 14 }}>
          This is a read-only summary. Payslips and detailed payroll history live on the Payroll page.
        </p>
        <dl className="detail-grid">
          <dt>Base salary</dt>
          <dd>{user.salaryBase != null ? `₹${Number(user.salaryBase).toLocaleString('en-IN')}` : 'Not set'}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Documents</h2>
        <p style={{ color: '#666', fontSize: 14 }}>Document upload is out of scope for this build. Placeholder list:</p>
        <ul>
          <li>Offer letter — not uploaded</li>
          <li>ID proof — not uploaded</li>
          <li>Latest payslip — see Payroll page</li>
        </ul>
      </div>
    </section>
  );
}
