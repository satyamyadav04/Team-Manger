import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/authContext';
import ProjectModal from '../component/ProjectModal';
import { formatRelativeTime } from '../utils/date';
import './projects.css';

const statusLabels = {
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};

const statusColors = {
  active: '#10b981',
  'on-hold': '#f59e0b',
  completed: '#7c6ff7',
  archived: '#6b7280',
};

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projects, setProjects } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  useEffect(() => {
    api.get('/projects')
      .then((response) => setProjects(response.data.data || []))
      .finally(() => setLoading(false));
  }, [setProjects]);

  const handleCreate = (project) => {
    setProjects((current) => [project, ...current]);
    setShowModal(false);
  };

  const handleEdit = (project) => {
    setProjects((current) => current.map((item) => item._id === project._id ? project : item));
    setEditProject(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) {
      return;
    }

    await api.delete(`/projects/${id}`);
    setProjects((current) => current.filter((project) => project._id !== id));
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <div className="projects-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">Projects</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const isOwner = project.owner?._id === user?._id || project.owner === user?._id;
            const progress = project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;

            return (
              <article
                key={project._id}
                className="project-card project-card-clickable"
                onClick={() => navigate(`/projects/${project._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/projects/${project._id}`);
                  }
                }}
              >
                <div className="project-card-top">
                  <div className="project-color-bar" style={{ background: project.color || 'var(--accent)' }} />
                  <div className="project-card-header">
                    <Link
                      to={`/projects/${project._id}`}
                      className="project-name"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {project.name}
                    </Link>
                    <div className="project-actions">
                      {isOwner && (
                        <>
                          <button
                            className="icon-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditProject(project);
                            }}
                            title="Edit"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(project._id);
                            }}
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="project-desc">{project.description || 'No description'}</p>
                </div>

                <div className="project-card-body">
                  <div className="project-stat-row">
                    <span className="project-stat">{project.taskCount || 0} tasks</span>
                    <span className="project-stat">{project.members?.length || 0} members</span>
                    <span className="project-status" style={{ color: statusColors[project.status] }}>
                      {statusLabels[project.status]}
                    </span>
                  </div>

                  <div className="project-progress">
                    <div className="project-progress-bar">
                      <div className="project-progress-fill" style={{ width: `${progress}%`, background: project.color || 'var(--accent)' }} />
                    </div>
                    <span className="project-progress-pct">{progress}%</span>
                  </div>

                  <div className="project-footer">
                    <div className="project-members">
                      {project.members?.slice(0, 4).map((member) => (
                        <img
                          key={member.user?._id || member._id}
                          src={member.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.user?.name || 'User'}`}
                          alt=""
                          className="member-avatar"
                          title={member.user?.name}
                        />
                      ))}
                    </div>
                    <span className="project-date">{formatRelativeTime(project.createdAt)}</span>
                  </div>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="project-card-link"
                  onClick={(event) => event.stopPropagation()}
                >
                  View Project
                </Link>
              </article>
            );
          })}
        </div>
      )}

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
      {editProject && <ProjectModal project={editProject} onClose={() => setEditProject(null)} onSave={handleEdit} />}
    </div>
  );
}
