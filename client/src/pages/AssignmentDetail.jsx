import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gradeSubmission } from '../api';
import { useAssignments } from '../context/AssignmentsContext';

import BackButton from '../components/common/BackButton';
import { DetailSkeleton } from '../components/common/LoadingSkeleton';
import AssignmentHeaderCard from '../components/assignment/AssignmentHeaderCard';
import AssignmentQrCard from '../components/assignment/AssignmentQrCard';
import SubmissionsTable from '../components/assignment/SubmissionsTable';
import AISummaryModal from '../components/assignment/AISummaryModal';
import EmptyState from '../components/common/EmptyState';

function AssignmentDetail() {
  const { id } = useParams();
  const { getCachedAssignment, updateCachedAssignment, assignmentDetails } = useAssignments();

  const cached = assignmentDetails[id];
  const [data, setData] = useState(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingGradeId, setSavingGradeId] = useState(null);
  const [selectedSummarySub, setSelectedSummarySub] = useState(null);

  const initGrades = (submissions) => {
    const grades = {};
    (submissions || []).forEach((sub) => {
      grades[sub.id] =
        sub.teacher_final_marks !== null && sub.teacher_final_marks !== undefined
          ? sub.teacher_final_marks
          : sub.ai_estimated_marks !== null && sub.ai_estimated_marks !== undefined
          ? sub.ai_estimated_marks
          : '';
    });
    setGradeInputs(grades);
  };

  const loadData = async (force = false) => {
    try {
      const resData = await getCachedAssignment(id, force);
      setData(resData);
      initGrades(resData.submissions);
    } catch (err) {
      if (!data) setError('Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cached) {
      setData(cached);
      initGrades(cached.submissions);
    }
    loadData(false);
  }, [id]);

  const handleGradeChange = (subId, val) =>
    setGradeInputs((prev) => ({ ...prev, [subId]: val }));

  const handleSaveGrade = async (subId) => {
    const val = gradeInputs[subId];
    if (val === '' || isNaN(Number(val))) {
      alert('Please enter a valid numeric mark.');
      return;
    }
    setSavingGradeId(subId);
    try {
      await gradeSubmission(subId, Number(val));
      updateCachedAssignment(id, (prev) => ({
        ...prev,
        submissions: prev.submissions.map((s) =>
          s.id === subId
            ? { ...s, teacher_final_marks: Number(val), grading_status: 'TEACHER_APPROVED' }
            : s
        ),
      }));
      loadData(true);
    } catch (err) {
      alert('Failed to save grade: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingGradeId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="page-container">
        <BackButton />
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <EmptyState
          icon="⚠️"
          title={error || 'Assignment not found'}
          description="The assignment may have been permanently removed or the link is invalid."
          action={
            <Link to="/dashboard" className="btn btn-primary">
              ← Back to Dashboard
            </Link>
          }
        />
      </div>
    );
  }

  const { assignment, submissions = [], qrCode } = data;
  const shareLink =
    assignment.shareable_link ||
    data?.shareableLink ||
    `${window.location.origin}/submit/${id}`;

  return (
    <div className="page-container">
      {/* ── Breadcrumb Navigation ── */}
      <BackButton to="/dashboard" label="Back to Dashboard" />

      {/* ── Detail Hero Grid ── */}
      <div className="detail-hero-grid">
        <AssignmentHeaderCard
          assignment={assignment}
          submissionCount={submissions.length}
        />
        <AssignmentQrCard qrCode={qrCode} shareLink={shareLink} />
      </div>

      {/* ── Submissions Table ── */}
      <SubmissionsTable
        submissions={submissions}
        maxMarks={assignment.max_marks}
        assignmentTitle={assignment.title}
        gradeInputs={gradeInputs}
        onGradeChange={handleGradeChange}
        onSaveGrade={handleSaveGrade}
        savingGradeId={savingGradeId}
        onOpenSummary={setSelectedSummarySub}
      />

      {/* ── AI Summary Modal ── */}
      <AISummaryModal
        submission={selectedSummarySub}
        maxMarks={assignment.max_marks}
        onClose={() => setSelectedSummarySub(null)}
      />
    </div>
  );
}

export default AssignmentDetail;
