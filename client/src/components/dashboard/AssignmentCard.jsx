import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import StatusPill from '../common/StatusPill';
import CopyButton from '../common/CopyButton';
import { formatDateTime, getDaysRemaining, isOverdue } from '../../utils/dateUtils';

export function AssignmentCard({ assignment, onDelete, onRestore, isActionLoading }) {
  const isDeleted = Boolean(assignment.is_deleted);
  const overdue = isOverdue(assignment.due_date);
  const studentLink = `${window.location.origin}/submit/${assignment.id}`;

  return (
    <div className={`assignment-card ${isDeleted ? 'assignment-card--deleted' : ''}`}>
      {/* Top decorative accent bar */}
      <div className="assignment-card__bar" />

      {/* Card Header */}
      <div className="assignment-card__header">
        <div className="assignment-card__badges">
          <Badge variant="indigo">
            {assignment.subject}
            {assignment.subject_code ? ` • ${assignment.subject_code}` : ''}
          </Badge>
          {assignment.department && <Badge variant="gray">{assignment.department}</Badge>}
        </div>

        <div className="assignment-card__actions">
          {!isDeleted ? (
            <button
              type="button"
              onClick={() => onDelete(assignment.id, assignment.title)}
              disabled={isActionLoading}
              title="Move to Trash (Recoverable for 3 days)"
              className="btn-icon-danger"
              aria-label="Delete Assignment"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRestore(assignment.id)}
              disabled={isActionLoading}
              title="Restore assignment"
              className="btn btn-success btn--sm"
            >
              {isActionLoading ? '…' : '♻️ Restore'}
            </button>
          )}
        </div>
      </div>

      {/* Trash Banner */}
      {isDeleted && (
        <div className="trash-banner">
          <span className="trash-banner__warning">⚠️ In Trash — Submissions Closed</span>
          <span className="trash-banner__time">⏳ {getDaysRemaining(assignment.deleted_at)}</span>
        </div>
      )}

      {/* Assignment Title */}
      <h3 className="assignment-card__title" title={assignment.title}>
        {assignment.title}
      </h3>

      <div className="assignment-card__summary">
        <span>{assignment.subject}{assignment.subject_code ? ` · ${assignment.subject_code}` : ''}</span>
        <span>{assignment.department || 'All departments'}</span>
      </div>

      {/* Meta details: 2x2 grid */}
      <div className="assignment-card__meta">
        <div className="meta-pill">
          <span className="meta-pill__label">Max Marks</span>
          <span className="meta-pill__value">{assignment.max_marks} pts</span>
        </div>

        <div className="meta-pill">
          <span className="meta-pill__label">Submissions</span>
          <span className="meta-pill__value meta-pill__value--accent">
            {assignment.submissionCount || 0} received
          </span>
        </div>

        <div className="meta-pill">
          <span className="meta-pill__label">Due Date</span>
          <span className={`meta-pill__value ${overdue ? 'text-danger' : ''}`}>
            {assignment.due_date ? formatDateTime(assignment.due_date) : 'No deadline set'}
          </span>
        </div>

        <div className="meta-pill">
          <span className="meta-pill__label">Status</span>
          <StatusPill isDeleted={isDeleted} isOverdue={overdue} />
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="assignment-card__footer">
        {!isDeleted ? (
          <div className="assignment-card__btn-row">
            <Link
              to={`/assignment/${assignment.id}`}
              className="btn btn-primary btn-card-primary"
            >
              <span>View Submissions</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>

            <CopyButton
              text={studentLink}
              label="Copy Link"
              copiedLabel="Copied"
              className="btn-card-share"
            />
          </div>
        ) : (
          <div className="card-actions-dual">
            <button
              type="button"
              onClick={() => onRestore(assignment.id)}
              disabled={isActionLoading}
              className="btn btn-success"
              style={{ flex: 1 }}
            >
              {isActionLoading ? 'Restoring...' : '♻️ Restore'}
            </button>
            <Link
              to={`/assignment/${assignment.id}`}
              className="btn btn-secondary"
              style={{ flex: 1, textAlign: 'center' }}
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentCard;
