import React from 'react';

export function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div className="sb-card sb-empty-state-card">
      <div className="sb-empty-state">
        <div className="sb-empty-icon">{icon}</div>
        <h3 className="sb-empty-title">{title}</h3>
        {description && <p className="sb-empty-desc">{description}</p>}
        {action && <div className="sb-empty-action">{action}</div>}
      </div>
    </div>
  );
}

export default EmptyState;
