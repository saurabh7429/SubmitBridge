import React from 'react';
import Badge from '../common/Badge';
import { formatDateTime } from '../../utils/dateUtils';

export function SubmissionRow({
  submission,
  index,
  maxMarks,
  gradeInput,
  onGradeChange,
  onSaveGrade,
  isSaving,
  onOpenSummary,
}) {
  const sub = submission;
  const aiScore = sub.ai_detection_score;
  const isApproved = sub.grading_status === 'TEACHER_APPROVED';

  return (
    <tr className="sb-table-row">
      <td className="sb-td-muted">{index + 1}</td>
      <td className="sb-td-roll">
        <strong>{sub.roll_number}</strong>
      </td>
      <td className="sb-td-name">
        <div className="sb-student-display-name">{sub.student_name}</div>
        {sub.student_email && (
          <div className="sb-student-display-email">
            {sub.student_email}
          </div>
        )}
      </td>
      <td className="sb-td-time">{formatDateTime(sub.submitted_at)}</td>
      <td>
        <a
          href={sub.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="sb-file-badge"
          title="Open uploaded file"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>View Doc</span>
        </a>
      </td>

      {/* AI Likelihood Score */}
      <td>
        {aiScore !== null && aiScore !== undefined ? (
          <Badge
            variant={aiScore > 50 ? 'red' : aiScore > 20 ? 'amber' : 'emerald'}
          >
            {aiScore > 50 ? '⚠️ ' : aiScore > 20 ? '⚡ ' : '✓ '}
            {aiScore}% AI
          </Badge>
        ) : (
          <span className="sb-text-faint-badge">
            {sub.ai_detection_status === 'SKIPPED' ? 'Skipped' : 'Not Scanned'}
          </span>
        )}
      </td>

      {/* AI Estimated Mark */}
      <td>
        {sub.ai_estimated_marks !== null && sub.ai_estimated_marks !== undefined ? (
          <div className="sb-ai-mark-cell">
            <span className="sb-ai-mark-pill">
              🤖 {Math.min(Number(maxMarks), Math.max(0, sub.ai_estimated_marks))} / {maxMarks}
            </span>
            <button
              type="button"
              onClick={() => onOpenSummary(sub)}
              className="sb-btn-link"
            >
              AI Summary →
            </button>
          </div>
        ) : (
          <span className="sb-text-faint-badge">Pending</span>
        )}
      </td>

      {/* Teacher Grade Input & Approve */}
      <td>
        <div className="sb-grade-inline-form">
          <input
            type="number"
            min={0}
            max={maxMarks}
            value={gradeInput ?? ''}
            onChange={(e) => onGradeChange(sub.id, e.target.value)}
            className="sb-input-grade"
            placeholder="Pts"
          />
          <button
            type="button"
            onClick={() => onSaveGrade(sub.id)}
            disabled={isSaving}
            className={`sb-btn sb-btn--sm ${isApproved ? 'sb-btn-approved' : 'sb-btn-primary'}`}
          >
            {isSaving ? (
              '...'
            ) : isApproved ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Approved</span>
              </>
            ) : (
              'Approve'
            )}
          </button>
        </div>
      </td>

      {/* Status */}
      <td>
        <Badge
          variant={isApproved ? 'emerald' : sub.grading_status === 'AI_ESTIMATED' ? 'indigo' : 'slate'}
        >
          {isApproved ? 'Verified' : sub.grading_status === 'AI_ESTIMATED' ? 'AI Evaluated' : 'Submitted'}
        </Badge>
      </td>
    </tr>
  );
}

export default SubmissionRow;
