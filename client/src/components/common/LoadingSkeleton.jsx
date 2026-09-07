import React from 'react';

export function CardSkeleton({ count = 3 }) {
  return (
    <div
      className={`assignment-grid ${
        count === 1 ? 'assignment-grid--single' : count === 2 ? 'assignment-grid--2col' : ''
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-line--pill" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--text" />
          <div className="skeleton-line skeleton-line--btn" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="detail-hero-grid">
      <div className="skeleton-card" style={{ height: 260 }}>
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--text" />
        <div className="skeleton-line skeleton-line--text" style={{ width: '80%' }} />
      </div>
      <div className="skeleton-card" style={{ height: 260 }}>
        <div className="skeleton-line skeleton-line--title" style={{ width: 120 }} />
        <div className="skeleton-line" style={{ height: 160, borderRadius: 12 }} />
      </div>
    </div>
  );
}

export default CardSkeleton;
