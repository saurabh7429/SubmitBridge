import React from 'react';
import Badge from '../common/Badge';
import { formatDateTime, isOverdue } from '../../utils/dateUtils';

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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Guidelines from Instructor</span>
          </div>
          <p className="sb-info-card-text">{assignment.instructions}</p>
        </div>
      )}

      <div className="sb-info-card sb-info-card--primary" style={{ marginBottom: 0 }}>
        <div className="sb-info-card-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Assignment Questions</span>
        </div>
        <p className="sb-info-card-text sb-pre-line">{assignment.questions}</p>
      </div>
    </div>
  );
}

export default StudentOverview;
