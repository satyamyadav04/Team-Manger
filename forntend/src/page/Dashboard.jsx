import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../api/api';
import { formatRelativeTime, isPastDate } from '../utils/date';
import './Dashboard.css';

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

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/stats')
      .then((response) => setData(response.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  const { stats = {}, projects = 0, recentTasks = [] } = data || {};

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="dashboard-sub">Here&apos;s what&apos;s happening across your projects</p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          New Project
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Tasks" value={stats.total || 0} color="#7c6ff7" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <StatCard label="In Progress" value={stats.inProgress || 0} color="#f59e0b" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
        <StatCard label="In Review" value={stats.review || 0} color="#3b82f6" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
        <StatCard label="Completed" value={stats.done || 0} color="#10b981" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="Overdue" value={stats.overdue || 0} color="#ef4444" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>} />
        <StatCard label="Projects" value={projects} color="#8b5cf6" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
      </div>

      {stats.total > 0 && (
        <div className="progress-section card">
          <div className="progress-header">
            <h3>Overall Progress</h3>
            <span className="progress-pct">{Math.round(((stats.done || 0) / stats.total) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill progress-todo" style={{ width: `${((stats.todo || 0) / stats.total) * 100}%` }} />
            <div className="progress-fill progress-inprogress" style={{ width: `${((stats.inProgress || 0) / stats.total) * 100}%` }} />
            <div className="progress-fill progress-review" style={{ width: `${((stats.review || 0) / stats.total) * 100}%` }} />
            <div className="progress-fill progress-done" style={{ width: `${((stats.done || 0) / stats.total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Tasks</h2>
          <Link to="/my-tasks" className="btn btn-ghost" style={{ fontSize: 13 }}>View all</Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">Tasks</div>
            <h3>No tasks yet</h3>
            <p>Create a project and start adding tasks</p>
          </div>
        ) : (
          <div className="recent-tasks">
            {recentTasks.map((task) => {
              const isOverdue = task.dueDate && task.status !== 'done' && isPastDate(task.dueDate);
              return (
                <Link key={task._id} to={`/projects/${task.project?._id}`} className="recent-task-card">
                  <div className="rtc-left">
                    <div className="rtc-project" style={{ color: task.project?.color || 'var(--accent)' }}>
                      <span className="dot" style={{ background: task.project?.color || 'var(--accent)' }} />
                      {task.project?.name}
                    </div>
                    <div className="rtc-title">{task.title}</div>
                    <div className="rtc-meta">
                      <span className={`badge ${statusConfig[task.status]?.class}`}>{statusConfig[task.status]?.label}</span>
                      <span className={`badge ${priorityConfig[task.priority]?.class}`}>{priorityConfig[task.priority]?.label}</span>
                    </div>
                  </div>
                  <div className="rtc-right">
                    {task.assignee && (
                      <img src={task.assignee.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee.name}`} alt="" className="rtc-avatar" />
                    )}
                    {task.dueDate && (
                      <span className={`rtc-due ${isOverdue ? 'overdue' : ''}`}>
                        {formatRelativeTime(task.dueDate)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
