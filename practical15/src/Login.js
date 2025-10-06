import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, getSession } from './session';

export default function Login() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // if already logged in, go to profile
  React.useEffect(() => {
    const s = getSession();
    if (s) navigate('/profile');
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name.');
      return;
    }
    if (trimmed.length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }
    createSession(trimmed);
    navigate('/profile');
  }

  return (
    <main className="container">
      <div className="card">
        <h2>Library Portal — Login</h2>
        <p className="muted">Enter your name to create a demo session.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            aria-describedby="nameHelp"
          />
          <div className="form-row" style={{ alignItems: 'center' }}>
            <button className="btn btn-primary" type="submit">Login</button>
          </div>
          {error && <div style={{ color: '#b91c1c', marginTop: 6 }}>{error}</div>}
        </form>
      </div>
    </main>
  );
}
