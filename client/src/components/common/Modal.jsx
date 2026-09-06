import React from 'react';

export function Modal({ isOpen, onClose, title, subtitle, icon = '🤖', children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card card-neumorphic" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <div className="modal-card__title">
            {icon && <span className="modal-icon">{icon}</span>}
            <div>
              {title && <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>}
              {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-card__body">{children}</div>

        {footer && <div className="modal-card__footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
