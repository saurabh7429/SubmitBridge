import React from 'react';
import Badge from '../common/Badge';
import { formatDateTime, isOverdue } from '../../utils/dateUtils';

export function StudentOverview({ assignment }) {
  const isLateClosed = isOverdue(assignment.due_date);

  return (
    <div className="student-card card-neumorphic" style={{ marginBottom: 24 }}>
      <div className="badge-group" style={{ marginBottom: 14 }}>
        <Badge variant="indigo">
          {assignment.subject}
          {assignment.subject_code ? ` • ${assignment.subject_code}` : ''}
        </Badge>
        <Badge variant="gray">
          Instructor: <strong>{assignment.teacher_name}</strong>
        </Badge>
        {isLateClosed && <Badge variant="red">⏰ Deadline Expired</Badge>}
      </div>

      <h2 className="student-card-title">{assignment.title}</h2>

      <div className="student-meta-strip">
        <div className="student-meta-item">
          <span>Maximum Marks:</span>
          <strong>{assignment.max_marks} pts</strong>
        </div>
        {assignment.due_date && (
          <div className="student-meta-item">
            <span>Submission Deadline:</span>
            <strong className={isLateClosed ? 'text-danger' : 'text-indigo'}>
              {formatDateTime(assignment.due_date)}
            </strong>
          </div>
        )}
      </div>

      {assignment.instructions && (
        <div className="info-box info-box--neutral">
          <div className="info-box__title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Guidelines from Instructor</span>
          </div>
          <p className="info-box__content">{assignment.instructions}</p>
        </div>
      )}

      <div className="info-box info-box--primary" style={{ marginBottom: 0 }}>
        <div className="info-box__title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Assignment Questions</span>
        </div>
        <p className="info-box__content whitespace-pre-line">{assignment.questions}</p>
      </div>
    </div>
  );
}

export default StudentOverview;
