import React, { useState } from 'react';
import api from '../api/api';
import './Modal.css';

export default function TaskModal({ task, projectId, members, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee: task?.assignee?._id || task?.assignee || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    tags: Array.isArray(task?.tags) ? task.tags.join(', ') : '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };
                                                 
  const handleSubmit = async (event) => {
    event.preventDefault();         
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...form,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
      };

      const response = task
        ? await api.patch(`/tasks/${task._id}`, payload)
        : await api.post(`/projects/${projectId}/tasks`, payload);
      onSave(response.data.data);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to save task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Create Task'}</h3>
          <button className="icon-btn" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
          </label>

          <div className="modal-grid">
            <label>
              Assignee
              <select name="assignee" value={form.assignee} onChange={handleChange}>
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user?._id || member.user} value={member.user?._id || member.user}>
                    {member.user?.name || 'Member'}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Due Date
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
            </label>
          </div>

          <div className="modal-grid">
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label>
              Priority
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
          </div>

          <label>
            Tags
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="frontend, api, urgent" />
          </label>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
