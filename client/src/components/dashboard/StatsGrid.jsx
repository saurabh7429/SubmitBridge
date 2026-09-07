import React from 'react';

export function StatsGrid({ activeCount = 0, trashCount = 0 }) {
  return (
    <div className="stats-grid">
      <div className="stat-card stat-card--indigo">
        <div className="stat-card__top">
          <div className="stat-card__icon stat-card__icon--indigo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
          </div>
          <span className="stat-card__badge stat-card__badge--indigo">Live</span>
        </div>
        <div className="stat-card__data">
          <span className="stat-card__value">{activeCount}</span>
          <span className="stat-card__label">Total Assignments</span>
        </div>
        <div className="stat-card__footer-hint">
          <span className="pulsing-dot pulsing-dot--green" />
          <span>Ready to receive submissions</span>
        </div>
      </div>

      <div className="stat-card stat-card--amber">
        <div className="stat-card__top">
          <div className="stat-card__icon stat-card__icon--amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
          <span className="stat-card__badge stat-card__badge--amber">Retention</span>
        </div>
        <div className="stat-card__data">
          <span className="stat-card__value">{trashCount}</span>
          <span className="stat-card__label">In Trash (3-Day Retention)</span>
        </div>
        <div className="stat-card__footer-hint">
          <span>⏳ Auto-purges after 72h</span>
        </div>
      </div>
    </div>
  );
}

export default StatsGrid;
