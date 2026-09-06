import React from 'react';

export function Badge({ children, variant = 'gray', className = '', title = '' }) {
  const variantClass = `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`} title={title}>
      {children}
    </span>
  );
}

export default Badge;
