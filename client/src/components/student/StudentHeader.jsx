import React from 'react';

export function StudentHeader({ collegeName, department }) {
  return (
    <header className="sb-student-header">
      <div className="sb-student-header-inner">
        <div className="sb-student-header-left">
          <div className="sb-student-crest">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
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
        </div>
      </div>
    </header>
  );
}

export default StudentHeader;
