import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import CopyButton from '../common/CopyButton';

export function AssignmentQrCard({ qrCode, shareLink }) {
  const [activeQr, setActiveQr] = useState(qrCode);

  useEffect(() => {
    if (shareLink) {
      QRCode.toDataURL(shareLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setActiveQr(dataUrl))
        .catch(() => setActiveQr(qrCode));
    }
  }, [shareLink, qrCode]);

  return (
    <div className="sb-card sb-detail-qr-card">
      <div className="sb-qr-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="5" height="5" x="3" y="3" rx="1" />
          <rect width="5" height="5" x="16" y="3" rx="1" />
          <rect width="5" height="5" x="3" y="16" rx="1" />
          <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
          <path d="M21 21v.01" />
          <path d="M12 7v3a2 2 0 0 1-2 2H7" />
          <path d="M3 12h.01" />
          <path d="M12 3h.01" />
          <path d="M12 16v.01" />
          <path d="M16 12h1" />
          <path d="M21 12v.01" />
          <path d="M12 21v-1" />
        </svg>
        <span>Student Submission QR</span>
      </div>

      <div className="sb-qr-image-frame">
        {activeQr ? (
          <img src={activeQr} alt="Student Submission QR Code" className="sb-qr-image" />
        ) : (
          <div className="sb-qr-empty">QR Code Generating...</div>
        )}
      </div>

      <div className="sb-qr-actions-stack">
        <CopyButton text={shareLink} label="Copy Student Link" />

        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="sb-btn sb-btn-secondary sb-btn--sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>Test Student Portal</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      <p className="sb-qr-caption">
        Students scan from their mobile devices or click link to submit documents.
      </p>
    </div>
  );
}

export default AssignmentQrCard;
