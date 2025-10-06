import React, { useState } from 'react';
import { registerUser } from './api';

export default function Register({ onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await registerUser(form);
    setLoading(false);
    if (res.token) {
      localStorage.setItem('token', res.token);
      onAuth();
    } else {
      setError(res.msg || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <h2>Register</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required autoFocus />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
      {error && <div className="message error">{error}</div>}
    </form>
  );
}
