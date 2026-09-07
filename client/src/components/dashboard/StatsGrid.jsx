import React from 'react';

export function StatsGrid({ activeCount = 0, trashCount = 0 }) {
  return (
    <div className="sb-stats-grid">
      <div className="sb-stat-card sb-stat-card--indigo">
        <div className="sb-stat-main">
          <div className="sb-stat-icon-wrapper sb-stat-icon-wrapper--indigo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
          </div>
          <div className="sb-stat-body">
            <span className="sb-stat-label">Active Assignments</span>
            <div className="sb-stat-val-row">
              <span className="sb-stat-value">{activeCount}</span>
              <span className="sb-badge sb-badge--indigo">Active</span>
            </div>
          </div>
        </div>
        <div className="sb-stat-footer">
          <span className="sb-pulsing-dot sb-pulsing-dot--green" />
          <span>Accepting submissions</span>
        </div>
      </div>

      <div className="sb-stat-card sb-stat-card--amber">
        <div className="sb-stat-main">
          <div className="sb-stat-icon-wrapper sb-stat-icon-wrapper--amber">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <div className="sb-stat-body">
            <span className="sb-stat-label">Archived in Trash</span>
            <div className="sb-stat-val-row">
              <span className="sb-stat-value">{trashCount}</span>
              <span className="sb-badge sb-badge--amber">Archive</span>
            </div>
          </div>
        </div>
        <div className="sb-stat-footer">
          <span>⏳ 3-day purge retention</span>
        </div>
      </div>
    </div>
  );
}

export default StatsGrid;
