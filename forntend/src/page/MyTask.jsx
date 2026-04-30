import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { formatDateMedium, isPastDate } from '../utils/date';
import './MyTasks.css';

const statusConfig = {
  todo: { label: 'To Do', class: 'badge-todo' },
  'in-progress': { label: 'In Progress', class: 'badge-in-progress' },
  review: { label: 'Review', class: 'badge-review' },
  done: { label: 'Done', class: 'badge-done' },
};

const priorityConfig = {
  critical: { label: 'Critical', class: 'badge-critical' },
  high: { label: 'High', class: 'badge-high' },
  medium: { label: 'Medium', class: 'badge-medium' },
  low: { label: 'Low', class: 'badge-low' },
};

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/tasks/my')
      .then((response) => setTasks(response.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}`, { status });
    setTasks((current) => current.map((task) => task._id === taskId ? response.data.data : task));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter !== 'all' && task.status !== filter) {
      return false;
    }
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const overdueTasks = tasks.filter((task) => task.dueDate && task.status !== 'done' && isPastDate(task.dueDate));

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <div className="my-tasks fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-sub">{tasks.length} total · {overdueTasks.length} overdue</p>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="overdue-banner">
          You have <strong>{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</strong>
        </div>
      )}

      <div className="tasks-toolbar">
        <div className="tasks-search">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." />
        </div>
        <div className="filter-tabs">
          {[['all', 'All'], ['todo', 'To Do'], ['in-progress', 'In Progress'], ['review', 'Review'], ['done', 'Done']].map(([value, label]) => (
            <button key={value} className={`filter-tab ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">Tasks</div>
          <h3>No tasks found</h3>
          <p>All caught up or no task matches the current filter.</p>
        </div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task) => {
            const isOverdue = task.dueDate && task.status !== 'done' && isPastDate(task.dueDate);
            return (
              <div key={task._id} className={`task-row ${isOverdue ? 'task-overdue' : ''}`}>
                <div className="task-row-check">
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => handleStatusChange(task._id, task.status === 'done' ? 'todo' : 'done')}
                    className="task-checkbox"
                  />
                </div>
                <div className="task-row-content">
                  <div className="task-row-title">{task.title}</div>
                  {task.project && (
                    <Link to={`/projects/${task.project._id}`} className="task-row-project">
                      <span className="dot" style={{ background: task.project.color || 'var(--accent)' }} />
                      {task.project.name}
                    </Link>
                  )}
                </div>
                <div className="task-row-badges">
                  <span className={`badge ${statusConfig[task.status]?.class}`}>{statusConfig[task.status]?.label}</span>
                  <span className={`badge ${priorityConfig[task.priority]?.class}`}>{priorityConfig[task.priority]?.label}</span>
                </div>
                <div className="task-row-due">{task.dueDate ? formatDateMedium(task.dueDate) : '-'}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
