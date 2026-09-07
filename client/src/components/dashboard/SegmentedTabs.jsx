import React from 'react';

export function SegmentedTabs({ activeTab, onTabChange, activeCount = 0, trashCount = 0 }) {
  return (
    <div className="sb-toolbar">
      <div className="sb-segmented-control">
        <button
          type="button"
          className={`sb-segment-btn ${activeTab === 'active' ? 'sb-segment-btn--active' : ''}`}
          onClick={() => onTabChange('active')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>Active Assignments</span>
          <span className="sb-segment-count">{activeCount}</span>
        </button>

        <button
          type="button"
          className={`sb-segment-btn ${activeTab === 'trash' ? 'sb-segment-btn--active' : ''}`}
          onClick={() => onTabChange('trash')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Trash</span>
          <span className="sb-segment-count">{trashCount}</span>
        </button>
      </div>
    </div>
  );
}

export default SegmentedTabs;
