import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teacher, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDashboard = location.pathname === '/dashboard';
  const isCreate = location.pathname === '/create' || location.pathname === '/create-assignment';

  return (
    <header className="sb-navbar">
      <div className="sb-navbar-inner">
        <Link to="/dashboard" className="sb-navbar-brand" title="SubmitBridge Home">
          <img src="/logo.png" alt="SubmitBridge Logo" className="sb-navbar-brand-logo" />
          <div className="sb-navbar-brand-copy">
            <div className="sb-navbar-brand-name">
              Submit<span className="sb-brand-accent">Bridge</span>
            </div>
            {teacher?.collegeName && (
              <div className="sb-navbar-college-badge" title={teacher.collegeName}>
                {teacher.collegeName}
              </div>
            )}
          </div>
        </Link>

        <nav className="sb-navbar-nav">
          <Link
            to="/dashboard"
            className={`sb-nav-item ${isDashboard ? 'sb-nav-item--active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/create"
            className={`sb-nav-item ${isCreate ? 'sb-nav-item--active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>New Assignment</span>
          </Link>
        </nav>

        <div className="sb-navbar-user-actions">
          {teacher?.name && (
            <div className="sb-user-chip" title={`Faculty: ${teacher.name}`}>
              <div className="sb-user-avatar">
                {teacher.name.charAt(0).toUpperCase()}
              </div>
              <div className="sb-user-meta">
                <span className="sb-user-name">{teacher.name}</span>
                <span className="sb-user-role">Faculty</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="sb-btn sb-btn-ghost sb-btn-logout"
            title="Sign out of account"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
