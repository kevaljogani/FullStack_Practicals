import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import './App.css';

function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const [view, setView] = useState('login');
  const [message, setMessage] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    setView('login');
    setMessage('You have been logged out.');
  };

  const handleAuth = () => {
    setAuth(true);
    setMessage('Login successful!');
  };

  if (auth) {
    return (
      <div className="App">
        <nav className="navbar">
          <span className="brand">Organization Portal</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </nav>
        <div className="dashboard">
          <h2>Welcome to Your Dashboard!</h2>
          <p style={{fontSize:'1.1rem', color:'#444'}}>Thank you for logging in. Here you can manage your profile, view updates, and access exclusive resources for organization members.</p>
          <div className="widgets-row">
            <div className="widget">
              <h3>Upcoming Events</h3>
              <ul>
                <li>Team Meeting – Sep 25, 2025</li>
                <li>Annual Conference – Oct 10, 2025</li>
                <li>Workshop: React Best Practices</li>
              </ul>
            </div>
            <div className="widget">
              <h3>Announcements</h3>
              <ul>
                <li>New portal features released!</li>
                <li>Check your email for the latest newsletter.</li>
                <li>Support is available 24/7.</li>
              </ul>
            </div>
            <div className="widget">
              <h3>Profile Quick Info</h3>
              <ul>
                <li><b>Status:</b> Active Member</li>
                <li><b>Last Login:</b> Just now</li>
                <li><b>Role:</b> User</li>
              </ul>
            </div>
          </div>
          <div className="dashboard-info">
            <p>Welcome to your organization portal! We’re glad to have you here. Explore the features, stay updated with announcements and events, and make the most of your membership.</p>
            <p>If you have any questions or need assistance, our team is here to help you every step of the way.</p>
          </div>
        </div>
        {message && <div className="message success">{message}</div>}
      </div>
    );
  }

  return (
    <div className="App">
      <nav className="navbar">
        <span className="brand">Organization Portal</span>
        <div>
          <button className={view==='login' ? 'active' : ''} onClick={() => setView('login')}>Login</button>
          <button className={view==='register' ? 'active' : ''} onClick={() => setView('register')}>Register</button>
        </div>
      </nav>
      <div className="form-container">
        {view === 'login' ? (
          <Login onAuth={handleAuth} />
        ) : (
          <Register onAuth={handleAuth} />
        )}
        {message && <div className="message success">{message}</div>}
      </div>
    </div>
  );
}

export default App;
