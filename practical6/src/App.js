import React, { useState } from 'react';
import './App.css';

function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const addTask = () => {
    if (task.trim() === '') return;
    if (editIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = task;
      setTasks(updatedTasks);
      setEditIndex(null);
    } else {
      setTasks([...tasks, task]);
    }
    setTask('');
  };

  const deleteTask = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
  };

  const editTask = (index) => {
    setTask(tasks[index]);
    setEditIndex(index);
  };

  return (
    <div className="container">
      <h1>Get Things Done !</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="What is the task today?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button onClick={addTask}>{editIndex !== null ? 'Update' : 'Add Task'}</button>
      </div>
      <div className="task-list">
        {tasks.map((t, index) => (
          <div className="task" key={index}>
            <span>{t}</span>
            <div className="icons">
              <button onClick={() => editTask(index)}>✏️</button>
              <button onClick={() => deleteTask(index)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
