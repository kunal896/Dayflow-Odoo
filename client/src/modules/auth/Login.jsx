import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Invalid email format');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('dayflow_token', data.data.token);
      localStorage.setItem('dayflow_user', JSON.stringify(data.data.user));
      toast.success('Login successful');
      navigate('/');
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

        <h1>Log in</h1>
        <p>Welcome back — check in starts here.</p>

        <form onSubmit={submit}>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary btn-block">Log in</button>
        </form>

        <p className="auth-foot">No account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}
