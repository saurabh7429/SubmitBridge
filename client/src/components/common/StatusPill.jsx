import React from 'react';

export function StatusPill({ status, isDeleted, isOverdue }) {
  if (isDeleted) {
    return (
      <span className="status-pill status-pill--danger" title="Archived in Trash">
        Archived
      </span>
    );
  }
  if (isOverdue || status === 'closed') {
    return (
      <span className="status-pill status-pill--danger" title="Submissions Closed">
        Closed
      </span>
    );
  }
  return (
    <span className="status-pill status-pill--success" title="Accepting Submissions">
      <span className="pulsing-dot pulsing-dot--green" />
      Accepting
    </span>
  );
}

export default StatusPill;
