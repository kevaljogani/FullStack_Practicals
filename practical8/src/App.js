import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Counter state
  const [count, setCount] = useState(
    parseInt(localStorage.getItem("count")) || 0
  );

  // Exercise name state
  const [exercise, setExercise] = useState(
    localStorage.getItem("exercise") || "No Exercise Selected"
  );

  // Timer state
  const [seconds, setSeconds] = useState(
    parseInt(localStorage.getItem("seconds")) || 0
  );
  const [isActive, setIsActive] = useState(false);

  // Save counter & exercise in localStorage
  useEffect(() => {
    localStorage.setItem("count", count);
  }, [count]);

  useEffect(() => {
    localStorage.setItem("exercise", exercise);
  }, [exercise]);

  useEffect(() => {
    localStorage.setItem("seconds", seconds);
  }, [seconds]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Format time
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="container">
      <h1>🏋️ Exercise Counter</h1>

      {/* Exercise input */}
      <div className="exercise-input">
        <input
          type="text"
          placeholder="Enter exercise name"
          onChange={(e) => setExercise(e.target.value)}
        />
      </div>

      <h2>{exercise}</h2>

      {/* Counter */}
      <div className="counter">
        <button onClick={() => setCount(count > 0 ? count - 1 : 0)}>-</button>
        <span>{count}</span>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>

      <button className="reset" onClick={() => setCount(0)}>
        Reset Counter
      </button>

      {/* Timer */}
      <div className="timer">
        <h3>⏱ Timer</h3>
        <p>{formatTime(seconds)}</p>
        <button onClick={() => setIsActive(true)}>Start</button>
        <button onClick={() => setIsActive(false)}>Pause</button>
        <button
          onClick={() => {
            setIsActive(false);
            setSeconds(0);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;
