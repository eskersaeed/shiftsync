import React, { useState } from 'react';
import API from '../api';

function Login({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/login', form);
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'demo@shiftsync.com', password: 'password123' });

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <h1>🏥 ShiftSync</h1>
        <p>Nurse Rota Management</p>
      </div>
      <h2>Welcome back</h2>
      <div className="demo-hint">
        🧪 <strong>Demo account:</strong> demo@shiftsync.com / password123
        <button onClick={fillDemo} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
          Fill in →
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="nurse@hospital.com" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div className="auth-switch">
        Don't have an account?{' '}
        <button onClick={onSwitch}>Register here</button>
      </div>
    </div>
  );
}

export default Login;