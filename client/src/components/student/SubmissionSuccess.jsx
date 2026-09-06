import React from 'react';

export function SubmissionSuccess({ message, rollNumber, submissionResult, onReset }) {
  const aiScore = submissionResult?.aiDetectionScore;

  return (
    <div className="student-card card-neumorphic student-success-box">
      <div className="success-badge">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h3 className="success-box-title">{message || 'Submission Uploaded Successfully!'}</h3>
      <p className="success-box-desc">
        Your assignment has been securely uploaded and cataloged under roll number <strong>{rollNumber}</strong>.
      </p>

      {aiScore !== null && aiScore !== undefined && aiScore > 50 && (
        <div className="alert alert-error" style={{ textAlign: 'left', marginTop: 20 }}>
          <div>
            <strong>⚠️ AI Similarity Warning ({aiScore}% AI Likelihood)</strong>
            <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>
              Automated screening flagged significant AI similarity. You can refine your submission in your own words and re-upload before the deadline.
            </p>
          </div>
        </div>
      )}

      <div className="alert alert-info" style={{ textAlign: 'left', marginTop: 16 }}>
        💡 <strong>Need to update or re-upload?</strong> You can resubmit anytime before the deadline. Submitting again with the same Roll Number will replace your prior submission.
      </div>

      <div style={{ marginTop: 24 }}>
        <button type="button" onClick={onReset} className="btn btn-secondary">
          Submit Again / Replace File
        </button>
      </div>
    </div>
  );
}

export default SubmissionSuccess;
