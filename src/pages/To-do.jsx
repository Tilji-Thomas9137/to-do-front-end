import React, { useState, useEffect } from 'react';
import '../css/styles.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

function ToDo() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [errors, setErrors] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!newTask.title.trim()) newErrors.title = 'Title is required';
    if (!newTask.description.trim()) newErrors.description = 'Description is required';
    if (!newTask.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/todos');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTask = async () => {
    if (!validateForm()) return alert('Please fill all fields before submitting.');
    try {
      const response = await fetch('http://localhost:5001/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' });
      setErrors({});
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`http://localhost:5001/api/todos/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditedTask(task);
  };

  const saveEditedTask = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/todos/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTask),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const updatedTask = await response.json();
      setTasks(tasks.map(task => (task._id === editingTaskId ? updatedTask : task)));
      setEditingTaskId(null);
      setEditedTask({ title: '', description: '', dueDate: '', priority: 'medium' });
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const calculateTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    if (diff <= 0) return 'Overdue';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="todo-container">
      <header className="header">
        <h1>My To-Do List</h1>
      </header>
      <div className="input-group">
        <input type="text" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className={`task-input ${errors.title ? 'error' : ''}`} />
        <input type="text" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className={`task-input ${errors.description ? 'error' : ''}`} />
        <input type="datetime-local" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className={`task-input ${errors.dueDate ? 'error' : ''}`} />
        <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="task-input">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={handleAddTask} className="add-btn"><FaPlus /> Add Task</button>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task._id} className="task-item">
            <div className="task-content">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <small>Due: {new Date(task.dueDate).toLocaleString()}</small>
              <p className="time-remaining">{calculateTimeRemaining(task.dueDate)}</p>
              <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
            </div>
            <div className="task-actions">
              <button className="edit-btn" onClick={() => handleEditTask(task)}><FaEdit /> Edit</button>
              <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}><FaTrash /> Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToDo;
