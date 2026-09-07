import React from 'react';
import { Link } from 'react-router-dom';
import CopyButton from '../common/CopyButton';

export function CreateAssignmentSuccess({ result, onReset }) {
  const shareLink =
    result?.shareableLink ||
    (result?.assignment?.id ? `${window.location.origin}/submit/${result.assignment.id}` : '');

  return (
    <div className="sb-success-container">
      <div className="sb-card sb-success-card">
        <div className="sb-success-icon-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="sb-success-title">Assignment Created Successfully!</h2>
        <p className="sb-success-subtitle">
          Your submission portal is active. Share the QR code or link with your students.
        </p>

        <div className="sb-success-qr-box">
          {result.qrCode ? (
            <img src={result.qrCode} alt="Student QR Code" className="sb-success-qr-img" />
          ) : null}
        </div>

        <div className="sb-share-input-row">
          <input type="text" readOnly value={shareLink} className="sb-input sb-share-url-field" />
          <CopyButton text={shareLink} label="Copy Link" copiedLabel="Copied!" />
        </div>

        <div className="sb-success-buttons">
          <Link
            to={`/assignment/${result.assignment?.id}`}
            className="sb-btn sb-btn-primary sb-btn--lg"
          >
            Go to Assignment Submissions →
          </Link>
          <button type="button" onClick={onReset} className="sb-btn sb-btn-secondary sb-btn--lg">
            + Create Another Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAssignmentSuccess;
