import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const FIELDS = [
  ['employeeId', 'Employee ID'],
  ['name', 'Full name'],
  ['email', 'Email'],
];

export default function Signup() {
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', password: '', role: 'employee' });
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Invalid email format');
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      return toast.error('Password must be at least 8 characters and include a letter and a number');
    }
    try {
      const { data } = await api.post('/auth/signup', form);
      toast.success(`Account created. Demo verification token: ${data.data.verificationToken}`);
      navigate('/login');
    } catch {
      // interceptor already toasted the error
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="ticks">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className={i === 3 ? 'on' : ''} />
            ))}
          </span>
          <span className="brand">Dayflow</span>
        </div>

        <h1>Create account</h1>
        <p>Set up access to your team's HRMS.</p>

        <form onSubmit={submit}>
          {FIELDS.map(([key, label]) => (
            <div className="field" key={key}>
              <label className="label" htmlFor={key}>{label}</label>
              <input
                id={key}
                className="input"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="role">Role</label>
            <select
              id="role"
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn btn-primary btn-block">Create account</button>
        </form>

        <p className="auth-foot">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
