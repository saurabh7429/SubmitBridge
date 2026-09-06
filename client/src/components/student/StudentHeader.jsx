import React from 'react';

export function StudentHeader({ collegeName, department }) {
  return (
    <header className="student-top-banner">
      <div className="student-banner-inner">
        <div className="student-banner-left">
          <div className="student-crest-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="student-banner-info">
            <div className="student-portal-tag">
              <span>SubmitBridge Student Portal</span>
            </div>
            <h1 className="student-college-heading">{collegeName || 'University Faculty'}</h1>
            {department && <p className="student-dept-sub">{department}</p>}
          </div>
        </div>

        <div className="student-banner-right">
          <div className="student-status-badge">
            <span className="pulsing-dot pulsing-dot--green" />
            <span>Submission Gateway Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default StudentHeader;
