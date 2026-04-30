import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './Auth.css';

export default function AuthPage({ mode = 'login' }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />
      </div>

      <div className="auth-container">
        <div className="auth-side">
          <span className="auth-kicker">Team Task Manager</span>
          <h2 className="auth-side-title">Keep projects, teammates, and deadlines in one place.</h2>
          <p className="auth-side-copy">
            Plan work, assign tasks, and track progress with a cleaner workflow for admins and members.
          </p>

          <div className="auth-side-grid">
            <div className="auth-side-card">
              <strong>Projects</strong>
              <span>Create and organize workstreams</span>
            </div>
            <div className="auth-side-card">
              <strong>Roles</strong>
              <span>Admin and member access control</span>
            </div>
            <div className="auth-side-card">
              <strong>Tasks</strong>
              <span>Assign, update, and track status</span>
            </div>
            <div className="auth-side-card">
              <strong>Dashboard</strong>
              <span>See progress and overdue work fast</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="var(--accent)" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="var(--accent)" opacity="0.5" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="var(--accent)" opacity="0.5" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="var(--accent)" opacity="0.7" />
              </svg>
            </div>
            <span>Taskflow</span>
          </div>

          <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Get started'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to your workspace' : 'Create your free account today'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                placeholder={isLogin ? 'Enter your password' : 'Minimum 6 characters'}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/signup' : '/login'}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
