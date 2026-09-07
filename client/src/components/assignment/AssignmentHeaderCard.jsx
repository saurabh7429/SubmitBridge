import React from 'react';
import Badge from '../common/Badge';
import StatusPill from '../common/StatusPill';
import { formatDate, formatDateTime, isOverdue } from '../../utils/dateUtils';

export function AssignmentHeaderCard({ assignment, submissionCount = 0 }) {
  const deadlinePassed = isOverdue(assignment.due_date);
  const isDeleted = Boolean(assignment.is_deleted);

  return (
    <div className="sb-card sb-detail-main-card">
      <div className="sb-detail-card-top">
        <div className="sb-badge-row">
          <Badge variant="indigo">
            {assignment.subject}
            {assignment.subject_code ? ` • ${assignment.subject_code}` : ''}
          </Badge>
          {assignment.department && <Badge variant="slate">{assignment.department}</Badge>}
          {assignment.college_name && <Badge variant="college">{assignment.college_name}</Badge>}
        </div>

        <div className="sb-status-box">
          <StatusPill isDeleted={isDeleted} isOverdue={deadlinePassed} />
        </div>
      </div>

      <h1 className="sb-detail-title">{assignment.title}</h1>

      <div className="sb-detail-stats-grid">
        <div className="sb-detail-stat-item">
          <span className="sb-detail-stat-label">Max Marks</span>
          <span className="sb-detail-stat-value">{assignment.max_marks} pts</span>
        </div>
        <div className="sb-detail-stat-item">
          <span className="sb-detail-stat-label">Created Date</span>
          <span className="sb-detail-stat-value">{formatDate(assignment.created_at)}</span>
        </div>
        {assignment.due_date && (
          <div className="sb-detail-stat-item">
            <span className="sb-detail-stat-label">Due Deadline</span>
            <span className={`sb-detail-stat-value ${deadlinePassed ? 'sb-text-danger' : ''}`}>
              {formatDateTime(assignment.due_date)}
            </span>
          </div>
        )}
        <div className="sb-detail-stat-item">
          <span className="sb-detail-stat-label">Submissions</span>
          <span className="sb-detail-stat-value sb-text-indigo">{submissionCount}</span>
        </div>
      </div>

      {assignment.instructions && (
        <div className="sb-info-card sb-info-card--neutral">
          <div className="sb-info-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Submission Guidelines</span>
          </div>
          <p className="sb-info-card-text">{assignment.instructions}</p>
        </div>
      )}

      {assignment.questions && (
        <div className="sb-info-card sb-info-card--primary">
          <div className="sb-info-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Questions / Problem Statements</span>
          </div>
          {(() => {
            const text = String(assignment.questions).trim();
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
            return <p className="sb-info-card-text sb-pre-line">{text}</p>;
          })()}
        </div>
      )}
    </div>
  );
}

export default AssignmentHeaderCard;
