import React, { useState } from 'react';
import { loginUser } from './api';

export default function Login({ onAuth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginUser(form);
    setLoading(false);
    if (res.token) {
      localStorage.setItem('token', res.token);
      onAuth();
    } else {
      setError(res.msg || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <h2>Login</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required autoFocus />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      {error && <div className="message error">{error}</div>}
    </form>
  );
}
