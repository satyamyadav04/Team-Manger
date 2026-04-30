import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import api from "../api/api";
import TaskModal from "../component/TaskModal";
import {
  formatDateMedium,
  formatDateShort,
  isPastDate,
} from "../utils/date";
import "./ProjectDetail.css";

const statusConfig = {
  todo: { label: "To Do", class: "badge-todo" },
  "in-progress": { label: "In Progress", class: "badge-in-progress" },
  review: { label: "Review", class: "badge-review" },
  done: { label: "Done", class: "badge-done" },
};

const priorityConfig = {
  critical: { label: "Critical", class: "badge-critical" },
  high: { label: "High", class: "badge-high" },
  medium: { label: "Medium", class: "badge-medium" },
  low: { label: "Low", class: "badge-low" },
};

const columns = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [view, setView] = useState("kanban");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");
  const [showMemberPanel, setShowMemberPanel] = useState(false);

  useEffect(() => {
    const loadProjectDetail = async () => {
      setLoading(true);
      setError("");

      const [projectResult, taskResult] = await Promise.allSettled([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ]);

      if (projectResult.status === "fulfilled") {
        setProject(projectResult.value.data.data);
      } else {
        setProject(null);
        setError(
          projectResult.reason?.response?.data?.message ||
            "Unable to load this project.",
        );
      }

      if (taskResult.status === "fulfilled") {
        setTasks(taskResult.value.data.data || []);
      } else {
        setTasks([]);
        if (projectResult.status !== "fulfilled") {
          setError(
            taskResult.reason?.response?.data?.message ||
              "Unable to load project tasks.",
          );
        } else {
          setError("Project loaded, but tasks could not be loaded right now.");
        }
      }

      setLoading(false);
    };

    loadProjectDetail();
  }, [id]);

  const isAdmin =
    project &&
    (project.owner?._id === user?._id ||
      project.owner === user?._id ||
      project.members?.some(
        (member) =>
          (member.user?._id || member.user) === user?._id &&
          member.role === "admin",
      ));

  const handleTaskSave = (task) => {
    if (editTask) {
      setTasks((current) =>
        current.map((item) => (item._id === task._id ? task : item)),
      );
      setEditTask(null);
      return;
    }

    setTasks((current) => [task, ...current]);
    setShowTaskModal(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    await api.delete(`/tasks/${taskId}`);
    setTasks((current) => current.filter((task) => task._id !== taskId));
  };

  const handleStatusChange = async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}`, { status });
    setTasks((current) =>
      current.map((task) => (task._id === taskId ? response.data.data : task)),
    );
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setMemberError("");

    try {
      const response = await api.post(`/projects/${id}/members`, {
        email: memberEmail,
      });
      setProject(response.data.data);
      setMemberEmail("");
    } catch (error) {
      setMemberError(error.response?.data?.message || "Failed to add member.");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) {
      return;
    }

    const response = await api.delete(`/projects/${id}/members/${userId}`);
    setProject(response.data.data);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="project-detail fade-in">
        <div className="card project-error-card">
          <h2>Project unavailable</h2>
          <p>{error}</p>
          <Link to="/projects" className="btn btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return <div style={{ padding: 32 }}>Project not found.</div>;
  }

  const tasksByStatus = columns.reduce((accumulator, column) => {
    accumulator[column.id] = tasks.filter((task) => task.status === column.id);
    return accumulator;
  }, {});
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate && task.status !== "done" && isPastDate(task.dueDate),
  ).length;

  return (
    <div className="project-detail fade-in">
      <div className="pd-header">
        <div className="pd-header-left">
          <Link to="/projects" className="back-link">
            Projects
          </Link>
          <div className="pd-title-row">
            <div
              className="pd-color-dot"
              style={{ background: project.color || "var(--accent)" }}
            />
            <h1 className="pd-title">{project.name}</h1>
          </div>
          {project.description && (
            <p className="pd-desc">{project.description}</p>
          )}
        </div>

        <div className="pd-header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === "kanban" ? "active" : ""}`}
              onClick={() => setView("kanban")}
            >
              Board
            </button>
            <button
              className={`toggle-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
          {isAdmin && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowMemberPanel((current) => !current)}
            >
              Team
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => setShowTaskModal(true)}
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="project-summary-grid">
        <div className="project-summary-card">
          <span className="project-summary-label">Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="project-summary-card">
          <span className="project-summary-label">Completed</span>
          <strong>{completedTasks}</strong>
        </div>
        <div className="project-summary-card">
          <span className="project-summary-label">Overdue</span>
          <strong>{overdueTasks}</strong>
        </div>
        <div className="project-summary-card">
          <span className="project-summary-label">Team Members</span>
          <strong>{project.members?.length || 0}</strong>
        </div>
      </div>

      {error && <div className="project-inline-notice">{error}</div>}

      {showMemberPanel && isAdmin && (
        <div className="member-panel card fade-in">
          <h3 className="member-panel-title">Team Members</h3>
          <form onSubmit={handleAddMember} className="member-add-form">
            <input
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
              type="email"
              placeholder="Invite by email..."
            />
            <button type="submit" className="btn btn-primary">
              Invite
            </button>
          </form>
          {memberError && (
            <p style={{ color: "#ef4444", fontSize: 13 }}>{memberError}</p>
          )}
          <div className="member-list">
            {project.members?.map((member) => (
              <div key={member.user?._id || member._id} className="member-row">
                <img
                  src={
                    member.user?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${member.user?.name || "User"}`
                  }
                  alt=""
                  className="member-row-avatar"
                />
                <div className="member-row-info">
                  <span className="member-row-name">{member.user?.name}</span>
                  <span className="member-row-email">{member.user?.email}</span>
                </div>
                <span
                  className={`badge ${member.role === "admin" ? "badge-review" : "badge-todo"}`}
                >
                  {member.role}
                </span>
                {member.user?._id !== user?._id && (
                  <button
                    className="icon-btn danger"
                    onClick={() => handleRemoveMember(member.user?._id)}
                    title="Remove member"
                    aria-label="Remove member"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "kanban" && (
        <div className="kanban-board">
          {columns.map((column) => (
            <div key={column.id} className="kanban-column">
              <div className="kanban-col-header">
                <span className={`badge ${statusConfig[column.id]?.class}`}>
                  {column.label}
                </span>
                <span className="kanban-count">
                  {tasksByStatus[column.id]?.length || 0}
                </span>
              </div>
              <div className="kanban-cards">
                {tasksByStatus[column.id]?.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isAdmin}
                    userId={user?._id}
                    onEdit={() => setEditTask(task)}
                    onDelete={() => handleDeleteTask(task._id)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "list" && (
        <div className="task-list-view">
          <div className="task-list-header">
            <span>Task</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Assignee</span>
            <span>Due Date</span>
            <span>Actions</span>
          </div>

          {tasks.length === 0 ?
            <div className="empty-state card">
              <div className="empty-state-icon">Tasks</div>
              <h3>No tasks</h3>
              <p>Add your first task to get started.</p>
            </div>
          : tasks.map((task) => (
              <div key={task._id} className="task-list-row">
                <div className="tlr-title">{task.title}</div>
                <div>
                  <select
                    value={task.status}
                    onChange={(event) =>
                      handleStatusChange(task._id, event.target.value)
                    }
                    className="status-select"
                  >
                    {columns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span
                    className={`badge ${priorityConfig[task.priority]?.class}`}
                  >
                    {priorityConfig[task.priority]?.label}
                  </span>
                </div>
                <div className="tlr-assignee">{task.assignee?.name || "-"}</div>
                <div>{task.dueDate ? formatDateMedium(task.dueDate) : "-"}</div>
                <div className="tlr-actions">
                  <button
                    className="icon-btn"
                    onClick={() => setEditTask(task)}
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => handleDeleteTask(task._id)}
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {(showTaskModal || editTask) && (
        <TaskModal
          task={editTask}
          projectId={id}
          members={project.members || []}
          onClose={() => {
            setShowTaskModal(false);
            setEditTask(null);
          }}
          onSave={handleTaskSave}
        />
      )}
    </div>
  );
}

function TaskCard({ task, isAdmin, userId, onEdit, onDelete, onStatusChange }) {
  const isOverdue =
    task.dueDate && task.status !== "done" && isPastDate(task.dueDate);
  const canEdit =
    isAdmin || task.createdBy?._id === userId || task.createdBy === userId;

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="task-tags">
          {task.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
        {canEdit && (
          <div className="task-card-actions">
            <button
              className="icon-btn"
              onClick={onEdit}
              title="Edit task"
              aria-label="Edit task"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              className="icon-btn danger"
              onClick={onDelete}
              title="Delete task"
              aria-label="Delete task"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <h4 className="task-card-title">{task.title}</h4>
      {task.description && <p className="task-card-desc">{task.description}</p>}

      <div className="task-card-footer">
        <span className={`badge ${priorityConfig[task.priority]?.class}`}>
          {priorityConfig[task.priority]?.label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task._id, event.target.value)}
            className="status-select"
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.label}
              </option>
            ))}
          </select>
          {task.dueDate && (
            <span className={`task-due ${isOverdue ? "overdue" : ""}`}>
              {formatDateShort(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
