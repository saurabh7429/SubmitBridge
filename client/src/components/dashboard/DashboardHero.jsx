import React from 'react';
import { Link } from 'react-router-dom';

export function DashboardHero({ teacherName }) {
  return (
    <div className="dashboard-hero">
      <div className="dashboard-hero__content">
        <div className="dashboard-hero__badge">
          <span className="pulsing-dot" />
          Faculty Portal Active
        </div>
        <h1 className="dashboard-hero__title">
          Welcome back{teacherName ? `, Prof. ${teacherName}` : ''}
        </h1>
        <p className="dashboard-hero__subtitle">
          Create assignments, distribute instant QR codes, and automate grading with AI analysis.
        </p>
      </div>

      <div className="dashboard-hero__action">
        <Link to="/create" className="btn btn-primary btn-glow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Create Assignment</span>
        </Link>
      </div>
    </div>
  );
}

export default DashboardHero;
