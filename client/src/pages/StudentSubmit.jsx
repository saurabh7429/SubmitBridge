import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getAssignmentForStudent, submitAssignment } from '../api';

function StudentSubmit() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await getAssignmentForStudent(assignmentId);
        setAssignment(res.data);
      } catch (err) {
        setError('Assignment not found or link is invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  // Validate and store selected file
  const processFile = (file) => {
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

    if (isPdf) {
      // PDF is always allowed
    } else if (isDocx && isDocxAllowed) {
      // DOCX allowed if enabled by teacher
    } else {
      setFileError(
        isDocxAllowed
          ? '❌ Only PDF (.pdf) or Word (.docx) files are accepted.'
          : '❌ Only PDF (.pdf) files are accepted for this assignment.'
      );
      setSelectedFile(null);
      return;
    }

    // 10MB size limit check
    if (file.size > 10 * 1024 * 1024) {
      setFileError('❌ File size exceeds 10MB limit. Please upload a smaller file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedFile) {
      setFileError('Please select a file before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('studentName', studentName.trim());
      formData.append('rollNumber', rollNumber.trim().toUpperCase());
      formData.append('file', selectedFile);

      const res = await submitAssignment(assignmentId, formData);
      setSuccessMessage(res.data.message || 'Submission successful!');
      setSubmissionResult(res.data.submission || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <p>Loading assignment submission portal...</p>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorBox}>
          <h3>⚠️ Invalid Link</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Check if submission is closed
  const isLateClosed =
    assignment.due_date &&
    !assignment.allow_late_submission &&
    new Date() > new Date(assignment.due_date);

  return (
    <div style={styles.page}>
      {/* Student Portal Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoBadge}>🎓 SubmitBridge</div>
          <h1 style={styles.collegeName}>{assignment.college_name}</h1>
          {assignment.department && (
            <p style={styles.deptText}>{assignment.department}</p>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {/* Assignment Information Card (Read-Only) */}
        <div style={styles.infoCard}>
          <div style={styles.badgeRow}>
            <span style={styles.subjectBadge}>
              {assignment.subject} {assignment.subject_code ? `(${assignment.subject_code})` : ''}
            </span>
            <span style={styles.teacherBadge}>
              Faculty: <strong>{assignment.teacher_name}</strong>
            </span>
          </div>

          <h2 style={styles.assignmentTitle}>{assignment.title}</h2>

          <div style={styles.metaRow}>
            <div>
              <span style={styles.metaLabel}>Max Marks:</span>{' '}
              <strong style={{ color: '#0f172a' }}>{assignment.max_marks}</strong>
            </div>
            {assignment.due_date && (
              <div>
                <span style={styles.metaLabel}>Due Date:</span>{' '}
                <strong style={{ color: isLateClosed ? '#dc2626' : '#2563eb' }}>
                  {new Date(assignment.due_date).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </strong>
              </div>
            )}
          </div>

          {assignment.instructions && (
            <div style={styles.instructionsContainer}>
              <span style={styles.sectionLabel}>📌 Submission Instructions:</span>
              <p style={styles.instructionsText}>{assignment.instructions}</p>
            </div>
          )}

          <div style={styles.questionsContainer}>
            <span style={styles.sectionLabel}>❓ Assignment Questions:</span>
            <pre style={styles.questionsText}>{assignment.questions}</pre>
          </div>
        </div>

        {/* Submission Confirmation OR Form */}
        {successMessage ? (
          <div style={styles.successCard}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
            <h3 style={styles.successHeading}>{successMessage}</h3>
            <p style={styles.successText}>
              Your assignment has been securely uploaded to the portal.
            </p>
            {submissionResult?.aiDetectionScore !== null &&
              submissionResult?.aiDetectionScore !== undefined &&
              submissionResult.aiDetectionScore > 50 && (
                <div style={styles.aiWarningCard}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#991b1b', fontSize: '14px' }}>
                    ⚠️ Originality Advisory: {submissionResult.aiDetectionScore}% AI Likelihood Detected
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: '1.4' }}>
                    Our preliminary screening flagged high probability of AI-generated content. If you used AI drafting tools, consider reviewing your answers in your own words and resubmitting before the due date.
                  </p>
                </div>
              )}

            <div style={styles.resubmitNotice}>
              <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>
                💡 <strong>Need to make changes?</strong> You can resubmit anytime before the deadline. Submitting again with the same Roll Number will automatically overwrite your previous file.
              </p>
            </div>
            <button
              onClick={() => {
                setSuccessMessage('');
                setSubmissionResult(null);
                setSelectedFile(null);
              }}
              style={styles.resubmitBtn}
            >
              Submit Another / Update Submission
            </button>
          </div>
        ) : isLateClosed ? (
          <div style={styles.closedCard}>
            <h3 style={{ color: '#dc2626', margin: '0 0 8px 0' }}>
              ⛔ Submissions Closed
            </h3>
            <p style={{ color: '#475569', margin: 0 }}>
              The deadline for this assignment has passed, and late submissions are not allowed by the faculty.
            </p>
          </div>
        ) : (
          /* Submission Form */
          <div style={styles.formCard}>
            <h3 style={styles.formHeading}>Upload Your Submission</h3>

            {error && <div style={styles.formError}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Student Full Name *</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  placeholder="e.g. Aryan Sharma"
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Roll Number / Student ID *</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  placeholder="e.g. 21CS042"
                  style={styles.formInput}
                />
                <span style={styles.fieldHint}>
                  Used to link and overwrite your submission if you re-upload.
                </span>
              </div>

              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Upload Assignment File *</label>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    assignment.allowed_file_types?.includes('docx')
                      ? '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      : '.pdf,application/pdf'
                  }
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {/* Interactive Click / Drop Zone */}
                <div
                  onClick={triggerFileDialog}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    ...styles.dropZone,
                    borderColor: isDragging
                      ? '#2563eb'
                      : selectedFile
                      ? '#16a34a'
                      : '#cbd5e1',
                    backgroundColor: isDragging
                      ? '#eff6ff'
                      : selectedFile
                      ? '#f0fdf4'
                      : '#f8fafc',
                  }}
                >
                  {selectedFile ? (
                    <div>
                      <p style={styles.selectedFileTitle}>
                        📄 <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                      <span style={styles.readyBadge}>
                        ✅ File ready for upload
                      </span>
                      <p style={styles.changeHint}>
                        Click here to change or replace file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                      <p style={{ fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>
                        Click to choose your assignment file
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        or drag and drop here (PDF {assignment.allowed_file_types?.includes('docx') ? 'or DOCX' : ''}, Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {fileError && <p style={styles.fileError}>{fileError}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitBtn,
                  backgroundColor: submitting ? '#94a3b8' : '#2563eb',
                }}
              >
                {submitting ? 'Uploading & Evaluating...' : '📤 Submit Assignment'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '28px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  logoBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: '#334155',
    color: '#93c5fd',
    padding: '4px 12px',
    borderRadius: '16px',
    marginBottom: '8px',
    letterSpacing: '0.05em',
  },
  collegeName: {
    fontSize: '22px',
    fontWeight: '800',
    margin: '0 0 4px 0',
  },
  deptText: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },
  main: {
    maxWidth: '760px',
    margin: '28px auto',
    padding: '0 20px 60px 20px',
  },
  centerContainer: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    padding: '20px',
  },
  errorBox: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  subjectBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '700',
  },
  teacherBadge: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
  },
  assignmentTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 16px 0',
  },
  metaRow: {
    display: 'flex',
    gap: '24px',
    fontSize: '13px',
    color: '#475569',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9',
  },
  metaLabel: {
    color: '#64748b',
  },
  sectionLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '4px',
  },
  instructionsContainer: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '14px',
  },
  instructionsText: {
    margin: 0,
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.4',
  },
  questionsContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '12px',
  },
  questionsText: {
    margin: 0,
    fontSize: '13px',
    color: '#1e293b',
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  formHeading: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 20px 0',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '10px',
  },
  formField: {
    marginBottom: '18px',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  fieldHint: {
    display: 'block',
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  dropZone: {
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '24px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectedFileTitle: {
    margin: '0 0 6px 0',
    fontSize: '14px',
    color: '#15803d',
  },
  readyBadge: {
    display: 'inline-block',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  changeHint: {
    fontSize: '11px',
    color: '#64748b',
    margin: '6px 0 0 0',
  },
  fileError: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '6px',
    fontWeight: '600',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
    marginTop: '8px',
  },
  formError: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '36px 24px',
    textAlign: 'center',
    border: '1px solid #bbf7d0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  successHeading: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#166534',
    margin: '0 0 8px 0',
  },
  successText: {
    fontSize: '14px',
    color: '#475569',
    margin: '0 0 16px 0',
  },
  aiWarningCard: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '14px',
    textAlign: 'left',
    marginBottom: '16px',
  },
  resubmitNotice: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '14px',
    textAlign: 'left',
    marginBottom: '20px',
  },
  resubmitBtn: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  closedCard: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
};

export default StudentSubmit;

