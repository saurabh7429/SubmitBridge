import React from 'react';

export function StatusPill({ status, isDeleted, isOverdue }) {
  if (isDeleted) {
    return (
      <span className="sb-status-pill sb-status-pill--danger" title="Archived in Trash">
        Archived
      </span>
    );
  }
  if (isOverdue || status === 'closed') {
    return (
      <span className="sb-status-pill sb-status-pill--danger" title="Submissions Closed">
        Closed
      </span>
    );
  }
  return (
    <span className="sb-status-pill sb-status-pill--success" title="Accepting Submissions">
      <span className="sb-pulsing-dot sb-pulsing-dot--green" />
      Accepting
    </span>
  );
}

export default StatusPill;
