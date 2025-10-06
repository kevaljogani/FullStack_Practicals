import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import sessionApi, { getSession, saveSession, clearSession, refreshSession, timeLeftMs } from './session';

const DEMO_BOOKS = [
  { id: 'b1', title: 'The Pragmatic Programmer', author: 'Andrew Hunt' },
  { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin' },
  { id: 'b3', title: 'You Don\'t Know JS', author: 'Kyle Simpson' },
  { id: 'b4', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke' },
];

export default function Profile() {
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate('/');
      return;
    }
    setSession(s);
    setTimeLeft(timeLeftMs(s));

    timerRef.current = setInterval(() => {
      const cur = getSession();
      if (!cur) {
        clearInterval(timerRef.current);
        setSession(null);
        navigate('/');
        return;
      }
      setSession(cur);
      setTimeLeft(timeLeftMs(cur));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [navigate]);

  function handleLogout() {
    clearSession();
    setSession(null);
    navigate('/');
  }

  function handleRefresh() {
    const refreshed = refreshSession(session);
    setSession(refreshed);
    setTimeLeft(timeLeftMs(refreshed));
  }

  function borrowBook(book) {
    const s = getSession();
    if (!s) return;
    if (!s.borrowed) s.borrowed = [];
    if (s.borrowed.find((b) => b.id === book.id)) return; // already borrowed
    s.borrowed.push({ ...book, borrowedAt: new Date().toISOString() });
    saveSession(s);
    setSession(s);
  }

  function returnBook(bookId) {
    const s = getSession();
    if (!s) return;
    s.borrowed = (s.borrowed || []).filter((b) => b.id !== bookId);
    saveSession(s);
    setSession(s);
  }

  if (!session) {
    return (
      <main className="container">
        <div className="card no-session">
          <h2>No active session</h2>
          <p>Please log in first to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        <div className="session-info">
          <div>
            <h2>Welcome, {session.name}!</h2>
            <p className="muted">You're logged in to the Library Portal.</p>
            <p style={{ marginTop: 12 }}>
              <strong>Login time:</strong>{' '}
              {new Date(session.loginTime).toLocaleString()}
            </p>

            <p style={{ marginTop: 6 }} className="muted">
              Session expires in <strong>{Math.ceil(timeLeft / 1000)}s</strong>. You can refresh
              to extend your session.
            </p>

            <div style={{ marginTop: 14 }}>
              <h3>Your borrowed books</h3>
              {(!session.borrowed || session.borrowed.length === 0) && (
                <p className="muted">You haven't borrowed any demo books yet.</p>
              )}
              <ul>
                {(session.borrowed || []).map((b) => (
                  <li key={b.id} style={{ marginBottom: 8 }}>
                    <strong>{b.title}</strong> — {b.author}{' '}
                    <small className="muted">(borrowed {new Date(b.borrowedAt).toLocaleString()})</small>
                    <div style={{ marginTop: 6 }}>
                      <button className="btn btn-ghost" onClick={() => returnBook(b.id)}>Return</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: 180 }}>
            <div className="badge">Active</div>
            <div style={{ height: 10 }} />
            <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
            <div style={{ height: 8 }} />
            <button className="btn btn-ghost" onClick={handleRefresh}>Refresh session</button>

            <div style={{ height: 18 }} />
            <div>
              <h4>Available demo books</h4>
              <ul>
                {DEMO_BOOKS.map((b) => (
                  <li key={b.id} style={{ marginBottom: 8 }}>
                    <strong>{b.title}</strong>
                    <div style={{ marginTop: 6 }}>
                      <button className="btn btn-primary" onClick={() => borrowBook(b)}>Borrow</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

