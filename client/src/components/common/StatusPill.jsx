import React from 'react';

export function StatusPill({ status, isDeleted, isOverdue }) {
  if (isDeleted) {
    return <span className="status-pill status-pill--danger">Archived in Trash</span>;
  }
  if (isOverdue || status === 'closed') {
    return <span className="status-pill status-pill--danger">Submissions Closed</span>;
  }
  return (
    <span className="status-pill status-pill--success">
      <span className="pulsing-dot pulsing-dot--green" />
      Accepting Submissions
    </span>
  );
}

export default StatusPill;
