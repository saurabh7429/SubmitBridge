import React from 'react';
import Badge from '../common/Badge';
import StatusPill from '../common/StatusPill';
import { formatDate, formatDateTime, isOverdue } from '../../utils/dateUtils';

export function AssignmentHeaderCard({ assignment, submissionCount = 0 }) {
  const deadlinePassed = isOverdue(assignment.due_date);
  const isDeleted = Boolean(assignment.is_deleted);

  return (
    <div className="detail-card-main card-neumorphic">
      <div className="detail-card-main__header">
        <div className="badge-group">
          <Badge variant="indigo">
            {assignment.subject}
            {assignment.subject_code ? ` • ${assignment.subject_code}` : ''}
          </Badge>
          {assignment.department && <Badge variant="gray">{assignment.department}</Badge>}
          {assignment.college_name && <Badge variant="college">{assignment.college_name}</Badge>}
        </div>

        <div className="status-indicator-box">
          <StatusPill isDeleted={isDeleted} isOverdue={deadlinePassed} />
        </div>
      </div>

      <h1 className="detail-card-main__title">{assignment.title}</h1>

      <div className="detail-stats-row">
        <div className="detail-stat">
          <span className="detail-stat__label">Max Marks</span>
          <span className="detail-stat__value">{assignment.max_marks} pts</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat__label">Created</span>
          <span className="detail-stat__value">{formatDate(assignment.created_at)}</span>
        </div>
        {assignment.due_date && (
          <div className="detail-stat">
            <span className="detail-stat__label">Due Deadline</span>
            <span className={`detail-stat__value ${deadlinePassed ? 'text-danger' : ''}`}>
              {formatDateTime(assignment.due_date)}
            </span>
          </div>
        )}
        <div className="detail-stat">
          <span className="detail-stat__label">Submissions</span>
          <span className="detail-stat__value text-indigo">{submissionCount}</span>
        </div>
      </div>

      {/* Submission Instructions */}
      {assignment.instructions && (
        <div className="info-box info-box--neutral">
          <div className="info-box__title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Submission Guidelines</span>
          </div>
          <p className="info-box__content">{assignment.instructions}</p>
        </div>
      )}

      {/* Problem Statements */}
      {assignment.questions && (
        <div className="info-box info-box--primary">
          <div className="info-box__title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Questions / Problem Statements</span>
          </div>
          <p className="info-box__content whitespace-pre-line">{assignment.questions}</p>
        </div>
      )}
    </div>
  );
}

export default AssignmentHeaderCard;
