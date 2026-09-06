import React from 'react';
import { Link } from 'react-router-dom';

export function BackButton({ to = '/dashboard', label = 'Back to Dashboard' }) {
  return (
    <div className="detail-top-bar">
      <Link to={to} className="btn-back-pill">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        <span>{label}</span>
      </Link>
    </div>
  );
}

export default BackButton;
