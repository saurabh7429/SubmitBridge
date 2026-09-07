import React from 'react';

export function Badge({ children, variant = 'slate', className = '', title = '' }) {
  return (
    <span className={`sb-badge sb-badge--${variant} ${className}`} title={title}>
      {children}
    </span>
  );
}

export default Badge;
