import React from 'react';
import { Link } from 'react-router-dom';

export function StudentHeader({ collegeName, department }) {
  return (
    <header className="sb-student-header">
      <div className="sb-student-header-inner">
        <div className="sb-student-header-left">
          <img src="/logo.png" alt="SubmitBridge Logo" className="sb-student-brand-logo" />
          <div className="sb-student-header-meta">
            <div className="sb-student-portal-tag">
              <span>SubmitBridge Student Portal</span>
            </div>
            <h1 className="sb-student-college-name">{collegeName || 'University Faculty'}</h1>
            {department && <p className="sb-student-dept-name">{department}</p>}
          </div>
        </div>

        <div className="sb-student-header-right">
          <div className="sb-status-badge">
            <span className="sb-pulsing-dot sb-pulsing-dot--green" />
            <span>Submission Gateway Active</span>
          </div>
          <Link to="/login" className="sb-btn sb-btn-ghost sb-btn-faculty-nav" title="Faculty Dashboard & Evaluation Login">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Faculty Portal ↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}


export default StudentHeader;
