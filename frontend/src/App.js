import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/tasks', { title, description, status });
      onTaskAdded(response.data); // Pass the newly added task to the parent component
      setTitle('');
      setDescription('');
      setStatus('To Do');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
}


function TaskList({ tasks, onTaskUpdated, onTaskDeleted }) {
  return (
    <ul>
      {tasks.map((task) => (
        <Task key={task._id} task={task} onTaskUpdated={onTaskUpdated} onTaskDeleted={onTaskDeleted} />
      ))}
    </ul>
  );
}

function Task({ task, onTaskUpdated, onTaskDeleted }) {
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axios.patch(`http://localhost:3000/tasks/${task._id}`, { status: newStatus });
      onTaskUpdated(task._id, { ...task, status: newStatus }); // Update the task status in the parent component
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${task._id}`);
      onTaskDeleted(task._id); // Delete the task from the parent component
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <li>
      <div>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <div>
        <select value={task.status} onChange={handleStatusChange}>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </li>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchData();
  }, []);

  const handleTaskAdded = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const handleTaskUpdated = (taskId, updatedTask) => {
    setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter((task) => task._id !== taskId));
  };

  return (
    <div>
      <h1>Todo App</h1>
      <TaskForm onTaskAdded={handleTaskAdded} />
      <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} onTaskDeleted={handleTaskDeleted} />
    </div>
  );
}

export default App;
