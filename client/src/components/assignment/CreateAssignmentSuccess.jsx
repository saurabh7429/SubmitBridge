import React from 'react';
import { Link } from 'react-router-dom';
import CopyButton from '../common/CopyButton';

export function CreateAssignmentSuccess({ result, onReset }) {
  const shareLink =
    result?.shareableLink ||
    (result?.assignment?.id ? `${window.location.origin}/submit/${result.assignment.id}` : '');

  return (
    <div className="create-success-container">
      <div className="card-neumorphic success-card">
        <div className="success-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 className="success-card__title">Assignment Created Successfully!</h2>
        <p className="success-card__desc">
          Your submission portal is ready. Share the QR code or link with your students.
        </p>

        <div className="success-qr-frame">
          {result.qrCode ? (
            <img src={result.qrCode} alt="Student QR Code" className="success-qr-img" />
          ) : null}
        </div>

        <div className="share-link-box">
          <input type="text" readOnly value={shareLink} className="share-link-input" />
          <CopyButton text={shareLink} label="Copy Link" copiedLabel="Copied!" />
        </div>

        <div className="success-action-btns">
          <Link
            to={`/assignment/${result.assignment?.id}`}
            className="btn btn-primary btn--lg"
          >
            Go to Assignment Submissions →
          </Link>
          <button type="button" onClick={onReset} className="btn btn-secondary">
            + Create Another Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAssignmentSuccess;
