import React from 'react';
import Badge from '../common/Badge';
import { formatDateTime, isOverdue } from '../../utils/dateUtils';

function renderQuestionsList(raw) {
  if (!raw) return null;
  const text = String(raw).trim();

  // If text already has line breaks, split by lines
  if (text.includes('\n')) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    return (
      <div className="sb-questions-list">
        {lines.map((line, idx) => (
          <div key={idx} className="sb-question-item">
            <span className="sb-question-text">{line}</span>
          </div>
        ))}
      </div>
    );
  }

  // If text has inline numbering like "1. ... 2. ... "
  const inlineQuestions = text
    .split(/(?=(?:^|\s)(?:\d+[\.\)]\s+|Q\d+[:\.\-]\s*))/i)
    .map((s) => s.trim())
    .filter(Boolean);

  if (inlineQuestions.length > 1) {
    return (
      <div className="sb-questions-list">
        {inlineQuestions.map((q, idx) => (
          <div key={idx} className="sb-question-item">
            <span className="sb-question-text">{q}</span>
          </div>
        ))}
      </div>
    );
  }

  // Fallback default
  return <p className="sb-info-card-text sb-pre-line">{text}</p>;
}

export function StudentOverview({ assignment }) {
  const isLateClosed = isOverdue(assignment.due_date);

  return (
    <div className="sb-card sb-student-card">
      <div className="sb-badge-row" style={{ marginBottom: 14 }}>
        <Badge variant="indigo">
          {assignment.subject}
          {assignment.subject_code ? ` • ${assignment.subject_code}` : ''}
        </Badge>
        <Badge variant="slate">
          Instructor: <strong>{assignment.teacher_name}</strong>
        </Badge>
        {isLateClosed && <Badge variant="red">⏰ Deadline Expired</Badge>}
      </div>

      <h2 className="sb-student-assignment-title">{assignment.title}</h2>

      <div className="sb-student-meta-strip">
        <div className="sb-student-meta-item">
          <span className="sb-student-meta-label">Maximum Marks</span>
          <strong className="sb-student-meta-val">{assignment.max_marks} pts</strong>
        </div>
        {assignment.due_date && (
          <div className="sb-student-meta-item">
            <span className="sb-student-meta-label">Submission Deadline</span>
            <strong className={`sb-student-meta-val ${isLateClosed ? 'sb-text-danger' : 'sb-text-indigo'}`}>
              {formatDateTime(assignment.due_date)}
            </strong>
          </div>
        )}
      </div>

      {assignment.instructions && (
        <div className="sb-info-card sb-info-card--neutral" style={{ marginBottom: 16 }}>
          <div className="sb-info-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Guidelines from Instructor</span>
          </div>
          <p className="sb-info-card-text">{assignment.instructions}</p>
        </div>
      )}

      {assignment.questions && (
        <div className="sb-info-card sb-info-card--primary" style={{ marginBottom: 0 }}>
          <div className="sb-info-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Assignment Questions</span>
          </div>
          {renderQuestionsList(assignment.questions)}
        </div>
      )}
    </div>
  );
}

export default StudentOverview;
