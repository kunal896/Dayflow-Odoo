import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

function currentUser() {
  return JSON.parse(localStorage.getItem('dayflow_user') || 'null');
}

const EMPLOYEE_FIELDS = ['address', 'phone', 'profilePicUrl'];
const ADMIN_FIELDS = ['name', 'email', 'employeeId', 'role', 'phone', 'address', 'jobTitle', 'profilePicUrl', 'salaryBase', 'isEmailVerified'];

export default function ProfileEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const me = currentUser();
  const editingSelf = !userId;
  const isAdmin = me?.role === 'admin';
  const fields = editingSelf ? EMPLOYEE_FIELDS : ADMIN_FIELDS;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const url = editingSelf ? '/profile/me' : `/profile/${userId}`;
        const { data } = await api.get(url);
        if (!cancelled) setForm(data.data.user);
      } catch {
        if (!cancelled) navigate(editingSelf ? '/profile' : '/admin');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId, editingSelf, navigate]);

  if (!editingSelf && !isAdmin) return <p>You don't have access to edit this profile.</p>;
  if (loading || !form) return <p>Loading…</p>;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {};
      for (const field of fields) body[field] = form[field] ?? '';
      const url = editingSelf ? '/profile/me' : `/profile/${userId}`;
      await api.put(url, body);
      toast.success('Profile updated');
      navigate(editingSelf ? '/profile' : `/profile/${userId}`);
    } catch {
      // shared axios interceptor already toasts the error
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 520 }}>
      <h1>Edit profile</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        {fields.includes('name') && (
          <label>Name
            <input value={form.name || ''} onChange={(e) => set('name', e.target.value)} />
          </label>
        )}
        {fields.includes('email') && (
          <label>Email
            <input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
          </label>
        )}
        {fields.includes('employeeId') && (
          <label>Employee ID
            <input value={form.employeeId || ''} onChange={(e) => set('employeeId', e.target.value)} />
          </label>
        )}
        {fields.includes('role') && (
          <label>Role
            <select value={form.role || 'employee'} onChange={(e) => set('role', e.target.value)}>
              <option value="employee">employee</option>
              <option value="admin">admin</option>
            </select>
          </label>
        )}
        {fields.includes('jobTitle') && (
          <label>Job title
            <input value={form.jobTitle || ''} onChange={(e) => set('jobTitle', e.target.value)} />
          </label>
        )}
        {fields.includes('phone') && (
          <label>Phone
            <input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" />
          </label>
        )}
        {fields.includes('address') && (
          <label>Address
            <input value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
          </label>
        )}
        {fields.includes('profilePicUrl') && (
          <label>Profile picture URL
            <input value={form.profilePicUrl || ''} onChange={(e) => set('profilePicUrl', e.target.value)} placeholder="https://…" />
          </label>
        )}
        {fields.includes('salaryBase') && (
          <label>Base salary
            <input type="number" step="0.01" value={form.salaryBase ?? ''} onChange={(e) => set('salaryBase', e.target.value)} />
          </label>
        )}
        {fields.includes('isEmailVerified') && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={!!form.isEmailVerified} onChange={(e) => set('isEmailVerified', e.target.checked)} style={{ width: 'auto' }} />
            Email verified
          </label>
        )}
        <button disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </section>
  );
}
