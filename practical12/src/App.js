import React, { useState } from 'react';
import './App.css';

function App() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateInputs = () => {
    if (isNaN(num1) || (isNaN(num2) && operation !== 'squareRoot')) {
      setError('Please enter valid numbers.');
      return false;
    }
    if (operation === 'divide' && parseFloat(num2) === 0) {
      setError('Division by zero is not allowed.');
      return false;
    }
    return true;
  };

  const handleCalculate = async () => {
    setError('');
    setResult(null);

    if (!validateInputs()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num1: parseFloat(num1),
          num2: parseFloat(num2),
          operation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleClear = () => {
    setNum1('');
    setNum2('');
    setOperation('add');
    setResult(null);
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kid's Calculator</h1>
        <p>Learn and play with numbers!</p>
        <div className="calculator-container">
          <input
            type="text"
            placeholder="Enter first number"
            value={num1}
            onChange={(e) => setNum1(e.target.value)}
          />
          <select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <option value="add">Addition (+)</option>
            <option value="subtract">Subtraction (-)</option>
            <option value="multiply">Multiplication (×)</option>
            <option value="divide">Division (÷)</option>
          </select>
          <input
            type="text"
            placeholder="Enter second number"
            value={num2}
            onChange={(e) => setNum2(e.target.value)}
            disabled={operation === 'squareRoot'}
          />
          <div className="button-group">
            <button onClick={handleCalculate}>Calculate</button>
            <button onClick={handleClear}>Clear</button>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        {result !== null && <p className="result-message">Result: {result}</p>}
        <footer>
          <p> solved the problem</p>
        </footer>
      </header>
    </div>
  );
}

export default App;
