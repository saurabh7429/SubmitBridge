import React from 'react';

export function FormField({
  label,
  required = false,
  hint,
  error,
  children,
  className = '',
}) {
  return (
    <div className={`sb-form-group ${className}`}>
      {label && (
        <label className="sb-form-label">
          {label} {required && <span className="sb-text-danger">*</span>}
        </label>
      )}
      {children}
      {hint && <span className="sb-form-hint">{hint}</span>}
      {error && <span className="sb-form-error">{error}</span>}
    </div>
  );
}

export default FormField;
