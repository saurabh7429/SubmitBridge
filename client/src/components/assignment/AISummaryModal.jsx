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
        <button type="button" onClick={onClose} className="sb-btn sb-btn-secondary sb-btn--block">
          Close Report
        </button>
      }
    >
      <div className="sb-modal-score-card">
        <span className="sb-modal-score-label">Estimated AI Score</span>
        <span className="sb-modal-score-val">
          {submission.ai_estimated_marks} <span className="sb-modal-score-max">/ {maxMarks}</span>
        </span>
      </div>

      <div className="sb-modal-section">
        <span className="sb-modal-section-title">Submission Summary</span>
        <div className="sb-modal-text-content">
          {submission.ai_summary || 'No summary provided by AI evaluator.'}
        </div>
      </div>

      {submission.ai_reasoning && (
        <div className="sb-modal-section">
          <span className="sb-modal-section-title">Marking Justification & Rationale</span>
          <div className="sb-modal-text-content sb-modal-text-content--highlight">
            {submission.ai_reasoning}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AISummaryModal;
