import React from 'react';

export function Modal({ isOpen, onClose, title, subtitle, icon = '🤖', children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="sb-modal-backdrop" onClick={onClose}>
      <div className="sb-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="sb-modal-header">
          <div className="sb-modal-heading-group">
            {icon && <span className="sb-modal-icon">{icon}</span>}
            <div>
              {title && <h3 className="sb-modal-title">{title}</h3>}
              {subtitle && <p className="sb-modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="sb-modal-close" aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="sb-modal-body">{children}</div>

        {footer && <div className="sb-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
