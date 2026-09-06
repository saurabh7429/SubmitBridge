import React from 'react';

export function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div className="card-neumorphic empty-state-card">
      <div className="empty-state">
        <div className="empty-state__icon">{icon}</div>
        <h3 className="empty-state__title">{title}</h3>
        {description && <p className="empty-state__desc">{description}</p>}
        {action && <div className="empty-state__action">{action}</div>}
      </div>
    </div>
  );
}

export default EmptyState;
