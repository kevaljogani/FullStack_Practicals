import React, { useState, useEffect } from 'react';
import './App.css';
function App() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Clean up interval on unmount
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString(); 
  const formattedTime = currentDateTime.toLocaleTimeString(); 

  return (
    <div class="container" style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Welcome to CHARUSAT!!!!</h1>
      <h2 id="date">It is {formattedDate}</h2>
      <h2 id="time">It is {formattedTime}</h2>
    </div>
  );
}

export default App;



