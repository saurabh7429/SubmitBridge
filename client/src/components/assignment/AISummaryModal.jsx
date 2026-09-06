import React from 'react';
import Modal from '../common/Modal';

export function AISummaryModal({ submission, maxMarks, onClose }) {
  if (!submission) return null;

  return (
    <Modal
      isOpen={Boolean(submission)}
      onClose={onClose}
      title="AI Assessment Report"
      subtitle={`${submission.student_name} (${submission.roll_number})`}
      icon="🤖"
      footer={
        <button type="button" onClick={onClose} className="btn btn-secondary btn--full">
          Close Report
        </button>
      }
    >
      <div className="modal-score-banner">
        <span className="modal-score-label">Estimated AI Score</span>
        <span className="modal-score-number">
          {submission.ai_estimated_marks} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/ {maxMarks}</span>
        </span>
      </div>

      <div className="modal-section">
        <span className="modal-section__heading">Submission Summary</span>
        <div className="modal-text-block">
          {submission.ai_summary || 'No summary provided by AI evaluator.'}
        </div>
      </div>

      {submission.ai_reasoning && (
        <div className="modal-section">
          <span className="modal-section__heading">Marking Justification & Rationale</span>
          <div className="modal-text-block modal-text-block--highlight">
            {submission.ai_reasoning}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AISummaryModal;
