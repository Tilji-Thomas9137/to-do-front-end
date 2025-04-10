import React, { useState, useEffect } from 'react';
import '../css/styles.css';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

function ToDo() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('https://to-do-backend-eej5.onrender.com/api/todos');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.dueDate) {
      alert('Please fill in all fields');
      return;
    }
    const utcDueDate = new Date(newTask.dueDate).toISOString(); // Convert local time to UTC
    const taskWithUtc = { ...newTask, dueDate: utcDueDate };

    try {
      const response = await fetch('https://to-do-backend-eej5.onrender.com/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithUtc),
      });
      if (!response.ok) throw new Error('Failed to add task');
      fetchTasks();
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`https://to-do-backend-eej5.onrender.com/api/todos/${taskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditedTask(task);
  };

  const saveEditedTask = async () => {
    const utcDueDate = new Date(editedTask.dueDate).toISOString(); // Convert local time to UTC
    const taskWithUtc = { ...editedTask, dueDate: utcDueDate };

    try {
      await fetch(`https://to-do-backend-eej5.onrender.com/api/todos/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithUtc),
      });
      fetchTasks();
      setEditingTaskId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    if (diffMs <= 0) return 'Time expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const formatDateForInput = (dateStr) => {
    const utcDate = new Date(dateStr); // Parse UTC date string
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getDate()).padStart(2, '0');
    const hours = String(utcDate.getHours()).padStart(2, '0');
    const minutes = String(utcDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`; // Format for datetime-local
  };

  return (
    <div className="todo-container">
      <header className="header">
        <h1>My To-Do List</h1>
      </header>
      <div className="input-group">
        <input type="text" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="task-input" />
        <input type="text" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="task-input" />
        <input type="datetime-local" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="task-input" />
        <button onClick={handleAddTask} className="add-btn"><FaPlus /> Add Task</button>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task._id} className="task-item">
            {editingTaskId === task._id ? (
              <div className="edit-modal">
                <h3>Edit Task</h3>
                <input type="text" value={editedTask.title} onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })} className="modal-input" />
                <input type="text" value={editedTask.description} onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })} className="modal-input" />
                <input
                  type="datetime-local"
                  value={formatDateForInput(editedTask.dueDate)}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                  className="modal-input"
                />
                <p>{calculateTimeRemaining(editedTask.dueDate)}</p>
                <div className="modal-actions">
                  <button className="save-btn" onClick={saveEditedTask}><FaSave /> Save</button>
                  <button className="cancel-btn" onClick={() => setEditingTaskId(null)}><FaTimes /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="task-content">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <small>Due: {new Date(task.dueDate).toLocaleString()}</small>
                <p>{calculateTimeRemaining(task.dueDate)}</p>
              </div>
            )}
            <div className="task-actions">
              {editingTaskId === task._id ? null : (
                <>
                  <button className="edit-btn" onClick={() => handleEditTask(task)}><FaEdit /> Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}><FaTrash /> Delete</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToDo;