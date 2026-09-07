import React from 'react';

export function SubmissionSuccess({ message, rollNumber, submissionResult, onReset }) {
  const aiScore = submissionResult?.aiDetectionScore;

  return (
    <div className="sb-card sb-submission-success-card">
      <div className="sb-success-icon-badge">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h3 className="sb-success-title">{message || 'Submission Uploaded Successfully!'}</h3>
      <p className="sb-success-subtitle">
        Your assignment document has been cataloged under roll number <strong>{rollNumber}</strong>.
      </p>

      {aiScore !== null && aiScore !== undefined && aiScore > 50 && (
        <div className="sb-alert sb-alert--error" style={{ textAlign: 'left', marginTop: 20 }}>
          <div>
            <strong>⚠️ AI Similarity Flag ({aiScore}% Likelihood)</strong>
            <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>
              Automated screening detected high AI similarity. You may revise your submission and re-upload before the deadline.
            </p>
          </div>
        </div>
      )}

      <div className="sb-alert sb-alert--info" style={{ textAlign: 'left', marginTop: 16 }}>
        💡 <strong>Need to update or re-upload?</strong> You can resubmit anytime before the deadline. Submitting with the same Roll Number will update your existing submission.
      </div>

      <div style={{ marginTop: 24 }}>
        <button type="button" onClick={onReset} className="sb-btn sb-btn-secondary sb-btn--md">
          Submit Again / Replace File
        </button>
      </div>
    </div>
  );
}

export default SubmissionSuccess;
