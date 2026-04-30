import React, { useState } from 'react';
import api from '../api/api';
import './Modal.css';

export default function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || '#0f766e',
    dueDate: project?.dueDate ? project.dueDate.slice(0, 10) : '',
    status: project?.status || 'active',
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
      const response = project
        ? await api.patch(`/projects/${project._id}`, form)
        : await api.post('/projects', form);
      onSave(response.data.data);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{project ? 'Edit Project' : 'Create Project'}</h3>
          <button className="icon-btn" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Project Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
          </label>

          <div className="modal-grid">
            <label>
              Color
              <input name="color" type="color" value={form.color} onChange={handleChange} />
            </label>

            <label>
              Due Date
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
            </label>
          </div>

          {project && (
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          )}

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
