import React from 'react';
import SubmissionRow from './SubmissionRow';
import EmptyState from '../common/EmptyState';

export function SubmissionsTable({
  submissions = [],
  maxMarks,
  gradeInputs = {},
  onGradeChange,
  onSaveGrade,
  savingGradeId,
  onOpenSummary,
}) {
  return (
    <div className="submissions-panel card-neumorphic">
      <div className="submissions-panel__header">
        <div>
          <h2 className="submissions-panel__title">
            Student Submissions ({submissions.length})
          </h2>
          <p className="submissions-panel__subtitle">
            AI estimates marks & checks originality. You have the ultimate authority to approve or adjust marks.
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon="📬"
          title="No submissions received yet"
          description="Share the QR code or link with your class. Submissions will appear here instantly in real-time."
        />
      ) : (
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Roll No.</th>
                <th>Student Name</th>
                <th>Submitted At</th>
                <th>Document</th>
                <th>AI Likelihood</th>
                <th>AI Estimate</th>
                <th>Final Grade</th>
                <th>Grading Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <SubmissionRow
                  key={sub.id}
                  submission={sub}
                  index={idx}
                  maxMarks={maxMarks}
                  gradeInput={gradeInputs[sub.id]}
                  onGradeChange={onGradeChange}
                  onSaveGrade={onSaveGrade}
                  isSaving={savingGradeId === sub.id}
                  onOpenSummary={onOpenSummary}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SubmissionsTable;
