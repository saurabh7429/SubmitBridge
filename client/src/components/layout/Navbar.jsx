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
  const isCreate = location.pathname === '/create';

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Left: Brand Logo & Institution */}
        <Link to="/dashboard" className="navbar__brand" title="SubmitBridge Home">
          <div className="navbar__logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="navbar__brand-text">
            <div className="navbar__logo-title">
              Submit<span className="brand-gradient">Bridge</span>
            </div>
            {teacher?.collegeName && (
              <div className="navbar__college-tag" title={teacher.collegeName}>
                {teacher.collegeName}
              </div>
            )}
          </div>
        </Link>

        {/* Center: Persistent Tab Navigation */}
        <nav className="navbar__nav-links">
          <Link
            to="/dashboard"
            className={`nav-link ${isDashboard ? 'nav-link--active' : ''}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1"/>
              <rect width="7" height="5" x="14" y="3" rx="1"/>
              <rect width="7" height="9" x="14" y="12" rx="1"/>
              <rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/create"
            className={`nav-link ${isCreate ? 'nav-link--active' : ''}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>New Assignment</span>
          </Link>
        </nav>

        {/* Right: Teacher Profile & Logout */}
        <div className="navbar__right">
          {teacher?.name && (
            <div className="teacher-pill" title={`Logged in as ${teacher.name}`}>
              <div className="teacher-pill__avatar">
                {teacher.name.charAt(0).toUpperCase()}
              </div>
              <div className="teacher-pill__info">
                <span className="teacher-pill__name">{teacher.name}</span>
                <span className="teacher-pill__role">Faculty</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-ghost-logout"
            title="Sign out of your account"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
