import React from 'react';

export function CardSkeleton({ count = 3 }) {
  return (
    <div
      className={`sb-cards-grid ${
        count === 1 ? 'sb-cards-grid--1col' : count === 2 ? 'sb-cards-grid--2col' : ''
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sb-skeleton-card">
          <div className="sb-skeleton-line sb-skeleton-line--badge" />
          <div className="sb-skeleton-line sb-skeleton-line--title" />
          <div className="sb-skeleton-line sb-skeleton-line--body" />
          <div className="sb-skeleton-line sb-skeleton-line--btn" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="sb-detail-hero-layout">
      <div className="sb-skeleton-card" style={{ height: 260 }}>
        <div className="sb-skeleton-line sb-skeleton-line--title" />
        <div className="sb-skeleton-line sb-skeleton-line--body" />
        <div className="sb-skeleton-line sb-skeleton-line--body" style={{ width: '80%' }} />
      </div>
      <div className="sb-skeleton-card" style={{ height: 260 }}>
        <div className="sb-skeleton-line sb-skeleton-line--title" style={{ width: 120 }} />
        <div className="sb-skeleton-line" style={{ height: 160, borderRadius: 'var(--sb-radius-md)' }} />
      </div>
    </div>
  );
}

export default CardSkeleton;
