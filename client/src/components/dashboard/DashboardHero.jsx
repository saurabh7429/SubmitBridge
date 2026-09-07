import React from 'react';
import { Link } from 'react-router-dom';

export function DashboardHero({ teacherName }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  const greetingName = teacherName
    ? teacherName.startsWith('Prof') || teacherName.startsWith('Dr')
      ? teacherName
      : `Prof. ${teacherName}`
    : '';

  return (
    <div className="sb-hero">
      <div className="sb-hero-content">
        <div className="sb-hero-pill-row">
          <span className="sb-hero-badge">
            <span className="sb-pulsing-dot sb-pulsing-dot--green" />
            Faculty Portal Active
          </span>
          <span className="sb-hero-session">Academic Session 2026</span>
        </div>
        <h1 className="sb-hero-title">
          {getGreeting()}{greetingName ? `, ${greetingName}` : ''}
        </h1>
        <p className="sb-hero-subtitle">
          Manage coursework, produce instant submission QR codes, and review submissions with automated AI assistance.
        </p>
      </div>

      <div className="sb-hero-action">
        <Link to="/create" className="sb-btn sb-btn-primary sb-btn--lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Create New Assignment</span>
        </Link>
      </div>
    </div>
  );
}

export default DashboardHero;
