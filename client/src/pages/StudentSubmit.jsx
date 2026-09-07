import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAssignmentForStudent, submitAssignment } from '../api';
import { isOverdue } from '../utils/dateUtils';

import StudentHeader from '../components/student/StudentHeader';
import StudentOverview from '../components/student/StudentOverview';
import FileDropZone from '../components/student/FileDropZone';
import SubmissionSuccess from '../components/student/SubmissionSuccess';
import FormField from '../components/forms/FormField';
import EmptyState from '../components/common/EmptyState';

function StudentSubmit() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await getAssignmentForStudent(assignmentId);
        setAssignment(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Assignment not found, moved to trash, or link is invalid.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  const handleFileSelect = (file) => {
    setFileError('');
    if (!file) return;

    const allowedTypes = assignment?.allowed_file_types || 'pdf';
    const isDocxAllowed = allowedTypes.includes('docx');

    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf' ||
      file.type === 'application/x-pdf';
    const isDocx =
      file.name.toLowerCase().endsWith('.docx') ||
      file.type.includes('wordprocessingml') ||
      file.type.includes('msword');

    if (!isPdf && !(isDocx && isDocxAllowed)) {
      setFileError(
        isDocxAllowed
          ? '⚠️ Only PDF (.pdf) or Word (.docx) documents are accepted.'
          : '⚠️ Only PDF (.pdf) documents are accepted for this assignment.'
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('⚠️ File size exceeds 10MB limit. Please upload a smaller file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!selectedFile) {
      setFileError('Please select an assignment document before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('studentName', studentName.trim());
      formData.append('rollNumber', rollNumber.trim().toUpperCase());
      formData.append('file', selectedFile);
      const res = await submitAssignment(assignmentId, formData);
      setSuccessMessage(res.data.message || 'Submission uploaded successfully!');
      setSubmissionResult(res.data.submission || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessMessage('');
    setSubmissionResult(null);
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="student-canvas">
        <div className="skeleton-card" style={{ maxWidth: 640, margin: '60px auto', height: 320 }}>
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--text" />
          <div className="skeleton-line" style={{ height: 120, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="student-canvas">
        <div style={{ maxWidth: 500, margin: '60px auto' }}>
          <EmptyState
            icon="🔒"
            title="Submission Portal Unavailable"
            description={error}
          />
        </div>
      </div>
    );
  }

  const deadlinePassed = isOverdue(assignment.due_date);

  return (
    <div className="student-canvas">
      {/* ── Top Header Banner ── */}
      <StudentHeader
        collegeName={assignment.college_name}
        department={assignment.department}
      />

      <main className="student-content-container">
        <div className="student-grid">
          {/* ── Left Column: Assignment Info Overview Card ── */}
          <StudentOverview assignment={assignment} />

          {/* ── Right Column: Form / Confirmation / Deadline Closed ── */}
          <div className="student-form-pane">
            {successMessage ? (
              <SubmissionSuccess
                message={successMessage}
                rollNumber={rollNumber}
                submissionResult={submissionResult}
                onReset={handleReset}
              />
            ) : deadlinePassed ? (
              <div className="student-card card-neumorphic" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>⏰</div>
                <h3 style={{ color: 'var(--danger)', fontSize: 20, marginBottom: 8 }}>
                  Submissions Closed
                </h3>
                <p style={{ color: 'var(--muted)', maxWidth: 440, margin: '0 auto' }}>
                  The deadline for this assignment has expired. New submissions are no longer accepted.
                </p>
              </div>
            ) : (
              <div className="student-card card-neumorphic">
                <h3 className="form-section-title">Submit Your Work</h3>
                <p className="form-section-subtitle">
                  Enter your student details and upload your assignment file.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="student-form">
                  <div className="form-row form-row--2col">
                    <FormField label="Full Name" required>
                      <input
                        type="text"
                        className="form-input"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                        placeholder="e.g. Aryan Sharma"
                      />
                    </FormField>

                    <FormField
                      label="Roll Number / Student ID"
                      required
                      hint="Used to identify and update your submission if you re-upload."
                    >
                      <input
                        type="text"
                        className="form-input"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        required
                        placeholder="e.g. 21CS042"
                      />
                    </FormField>
                  </div>

                  {/* Upload Dropzone */}
                  <FileDropZone
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    allowedFileTypes={assignment.allowed_file_types}
                    fileError={fileError}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-glow btn--full btn--lg"
                    style={{ marginTop: 12 }}
                  >
                    {submitting ? 'Uploading & Analyzing...' : 'Submit Assignment Now →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentSubmit;
