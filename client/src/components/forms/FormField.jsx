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
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="file-error-text">{error}</span>}
    </div>
  );
}

export default FormField;
