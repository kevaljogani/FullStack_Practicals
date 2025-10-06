import React, { useState } from 'react';
import './App.css';

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(0);

  const handleSubmit = () => {
    if (firstName.trim() && lastName.trim()) {
      setSubmitted(true);
    } else {
      alert("Please fill in both First Name and Last Name.");
    }
  };

  return (
    <div className="App">
      <div className="form-container">
        <h2>Welcome to CHARUSAT!!!</h2>
        <label>
          First Name:
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <label>
          Last Name:
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        <button onClick={handleSubmit}>Submit</button>
      </div>

      {submitted && (
        <div className="result-container">
          <h2>Welcome, {firstName} {lastName}!</h2>
          <h3>Count: {count}</h3>
          <div className="button-group">
            <button onClick={() => setCount(0)}>Reset</button>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
            <button onClick={() => setCount(count + 5)}>Increment 5</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
