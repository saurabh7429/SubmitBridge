import React from 'react';

export function StudentHeader({ collegeName, department }) {
  return (
    <header className="student-top-banner">
      <div className="student-banner-inner">
        <div className="student-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <span>SubmitBridge Student Portal</span>
        </div>
        <div className="student-institution">
          <h1>{collegeName}</h1>
          {department && <p>{department}</p>}
        </div>
      </div>
    </header>
  );
}

export default StudentHeader;
