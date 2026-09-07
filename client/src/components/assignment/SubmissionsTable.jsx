import React, { useState, useMemo } from 'react';
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
  assignmentTitle = 'Assignment',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        sub.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.student_email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'GRADED') {
        return sub.grading_status === 'TEACHER_APPROVED';
      }
      if (statusFilter === 'PENDING') {
        return sub.grading_status !== 'TEACHER_APPROVED';
      }
      return true;
    });
  }, [submissions, searchTerm, statusFilter]);

  const gradedCount = submissions.filter((s) => s.grading_status === 'TEACHER_APPROVED').length;
  const pendingCount = submissions.length - gradedCount;

  const handleExportCSV = () => {
    if (!submissions.length) return;
    const headers = ['Roll Number', 'Student Name', 'Student Email', 'Submitted At', 'AI Score (%)', 'AI Estimated Marks', 'Final Grade', 'Status'];
    const rows = submissions.map((s) => [
      `"${s.roll_number || ''}"`,
      `"${s.student_name || ''}"`,
      `"${s.student_email || ''}"`,
      `"${new Date(s.submitted_at).toLocaleString()}"`,
      s.ai_detection_score !== null && s.ai_detection_score !== undefined ? s.ai_detection_score : 'N/A',
      s.ai_estimated_marks !== null && s.ai_estimated_marks !== undefined ? s.ai_estimated_marks : 'N/A',
      s.final_marks !== null && s.final_marks !== undefined ? s.final_marks : (gradeInputs[s.id] ?? ''),
      `"${s.grading_status || 'PENDING'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safeTitle = (assignmentTitle || 'Assignment').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeTitle}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="sb-card sb-submissions-panel">
      <div className="sb-submissions-header">
        <div>
          <div className="sb-submissions-badge-row">
            <span className="sb-badge sb-badge--indigo">Submissions Log</span>
            <span className="sb-submissions-chip">{submissions.length} Total</span>
          </div>
          <h2 className="sb-submissions-title">Student Submissions</h2>
          <p className="sb-submissions-subtitle">
            AI calculates estimated marks & integrity score. Review and finalize grades for students.
          </p>
        </div>

        {submissions.length > 0 && (
          <div className="sb-submissions-actions">
            <button
              type="button"
              onClick={handleExportCSV}
              className="sb-btn sb-btn-secondary sb-btn--sm"
              title="Download submissions as CSV spreadsheet"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {submissions.length > 0 && (
        <div className="sb-submissions-toolbar">
          <div className="sb-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sb-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sb-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="sb-search-clear"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sb-filter-tabs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`sb-filter-tab ${statusFilter === 'ALL' ? 'sb-filter-tab--active' : ''}`}
            >
              All ({submissions.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('GRADED')}
              className={`sb-filter-tab ${statusFilter === 'GRADED' ? 'sb-filter-tab--active' : ''}`}
            >
              Approved ({gradedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={`sb-filter-tab ${statusFilter === 'PENDING' ? 'sb-filter-tab--active' : ''}`}
            >
              Pending ({pendingCount})
            </button>
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <EmptyState
          icon="📬"
          title="No submissions received yet"
          description="Share the QR code or link with your class. Submissions will appear here in real-time."
        />
      ) : filteredSubmissions.length === 0 ? (
        <div className="sb-empty-filter">
          <p>No submissions match your query: "<strong>{searchTerm}</strong>"</p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
            className="sb-btn sb-btn-secondary sb-btn--sm"
            style={{ marginTop: 10 }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="sb-table-responsive">
          <table className="sb-table">
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
              {filteredSubmissions.map((sub, idx) => (
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
