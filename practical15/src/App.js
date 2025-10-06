import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Profile from './Profile';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="App-nav">
          <Link to="/">Login</Link>
          {' | '}
          <Link to="/profile">Profile</Link>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
