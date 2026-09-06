import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssignment, gradeSubmission } from '../api';

function AssignmentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // State to track in-place grade edits
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingGradeId, setSavingGradeId] = useState(null);
  const [selectedSummarySub, setSelectedSummarySub] = useState(null);

  const fetchAssignmentData = async () => {
    try {
      const res = await getAssignment(id);
      setData(res.data);
      // Initialize teacher final marks inputs
      const initialGrades = {};
      res.data.submissions.forEach((sub) => {
        initialGrades[sub.id] =
          sub.teacher_final_marks !== null && sub.teacher_final_marks !== undefined
            ? sub.teacher_final_marks
            : sub.ai_estimated_marks !== null && sub.ai_estimated_marks !== undefined
            ? sub.ai_estimated_marks
            : '';
      });
      setGradeInputs(initialGrades);
    } catch (err) {
      setError('Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const handleCopyLink = () => {
    const link =
      data?.assignment?.shareable_link ||
      data?.shareableLink ||
      `${window.location.origin}/submit/${id}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy(link);
      });
    } else {
      fallbackCopy(link);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleGradeChange = (subId, val) => {
    setGradeInputs((prev) => ({ ...prev, [subId]: val }));
  };

  const handleSaveGrade = async (subId) => {
    const val = gradeInputs[subId];
    if (val === '' || isNaN(Number(val))) {
      alert('Please enter a valid numeric mark.');
      return;
    }

    setSavingGradeId(subId);
    try {
      await gradeSubmission(subId, Number(val));
      // Refresh list to update status badge
      await fetchAssignmentData();
    } catch (err) {
      alert('Failed to save grade: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingGradeId(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading assignment and submissions...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: '#dc2626' }}>{error || 'Assignment not found.'}</p>
        <Link to="/dashboard" style={styles.backBtn}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const { assignment, submissions, qrCode } = data;

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <Link to="/dashboard" style={styles.backBtn}>
            ← Back to Dashboard
          </Link>
          <span style={styles.navTitle}>SubmitBridge Faculty View</span>
        </div>
      </header>

      <main style={styles.main}>
        {/* Assignment Header Card */}
        <div style={styles.headerCard}>
          <div style={styles.headerLeft}>
            <div style={styles.badgesRow}>
              <span style={styles.subjectBadge}>
                {assignment.subject} {assignment.subject_code ? `(${assignment.subject_code})` : ''}
              </span>
              {assignment.department && (
                <span style={styles.deptBadge}>{assignment.department}</span>
              )}
              <span style={styles.collegeBadge}>{assignment.college_name}</span>
            </div>

            <h1 style={styles.title}>{assignment.title}</h1>

            <div style={styles.metaGrid}>
              <div>
                <span style={styles.metaLabel}>Max Marks:</span>{' '}
                <strong>{assignment.max_marks}</strong>
              </div>
              <div>
                <span style={styles.metaLabel}>Created:</span>{' '}
                {new Date(assignment.created_at).toLocaleDateString()}
              </div>
              {assignment.due_date && (
                <div>
                  <span style={styles.metaLabel}>Due Date:</span>{' '}
                  <strong style={{ color: '#dc2626' }}>
                    {new Date(assignment.due_date).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </strong>
                </div>
              )}
              <div>
                <span style={styles.metaLabel}>Submission Status:</span>{' '}
                <strong
                  style={{
                    color:
                      assignment.due_date && new Date() > new Date(assignment.due_date)
                        ? '#dc2626'
                        : '#16a34a',
                  }}
                >
                  {assignment.due_date && new Date() > new Date(assignment.due_date)
                    ? '⛔ Closed'
                    : '🟢 Open'}
                </strong>
              </div>
            </div>

            {assignment.instructions && (
              <div style={styles.instructionsBox}>
                <span style={styles.instructionsHeading}>📌 Instructions:</span>
                <p style={styles.instructionsText}>{assignment.instructions}</p>
              </div>
            )}

            <div style={styles.questionsBox}>
              <span style={styles.questionsHeading}>❓ Questions:</span>
              <pre style={styles.questionsText}>{assignment.questions}</pre>
            </div>
          </div>

          {/* QR & Shareable Link Side Box */}
          <div style={styles.qrSidebar}>
            <h4 style={styles.qrHeading}>📱 Student Submission QR</h4>
            {qrCode && (
              <img src={qrCode} alt="Submission QR" style={styles.qrImage} />
            )}
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleCopyLink} style={styles.copyBtn}>
                {copied ? '✅ Link Copied!' : '📋 Copy Student Link'}
              </button>
            </div>
            <p style={styles.qrNote}>
              Students scan this QR or click the link to submit from any device.
            </p>
          </div>
        </div>

        {/* Submissions Section */}
        <div style={styles.submissionsSection}>
          <div style={styles.sectionTitleRow}>
            <h2 style={styles.sectionHeading}>
              📥 Student Submissions ({submissions.length})
            </h2>
            <div style={styles.aiLegend}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                🤖 AI estimates marks & scans originality. Teacher has final say.
              </span>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div style={styles.emptySubmissions}>
              <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>📭</p>
              <h3 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>
                No submissions received yet
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                Share the submission link with students to start receiving assignments.
              </p>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Roll Number</th>
                    <th style={styles.th}>Student Name</th>
                    <th style={styles.th}>Submitted At</th>
                    <th style={styles.th}>File</th>
                    <th style={styles.th}>AI Likelihood (Phase 3)</th>
                    <th style={styles.th}>AI Mark (Phase 2)</th>
                    <th style={styles.th}>Final Grade (Teacher)</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, idx) => {
                    const aiScore = sub.ai_detection_score;
                    const isApproved = sub.grading_status === 'TEACHER_APPROVED';

                    return (
                      <tr key={sub.id} style={styles.tableRow}>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>
                          {sub.roll_number}
                        </td>
                        <td style={{ ...styles.td, color: '#334155' }}>
                          {sub.student_name}
                        </td>
                        <td style={{ ...styles.td, fontSize: '12px', color: '#64748b' }}>
                          {new Date(sub.submitted_at).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td style={styles.td}>
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.fileLink}
                          >
                            📄 View File
                          </a>
                        </td>
                        {/* Phase 3: AI Detection Flag */}
                        <td style={styles.td}>
                          {aiScore !== null && aiScore !== undefined ? (
                            <span
                              style={{
                                ...styles.aiDetectionBadge,
                                backgroundColor:
                                  aiScore > 50
                                    ? '#fee2e2'
                                    : aiScore > 20
                                    ? '#fef3c7'
                                    : '#ecfdf5',
                                color:
                                  aiScore > 50
                                    ? '#991b1b'
                                    : aiScore > 20
                                    ? '#92400e'
                                    : '#065f46',
                              }}
                            >
                              {aiScore}% AI Flag
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {sub.ai_detection_status === 'SKIPPED' ? 'Skipped' : 'Not scanned'}
                            </span>
                          )}
                        </td>

                        {/* Phase 2: AI Estimated Mark & Summary */}
                        <td style={styles.td}>
                          {sub.ai_estimated_marks !== null && sub.ai_estimated_marks !== undefined ? (
                            <div>
                              <span style={styles.aiMarkBadge}>
                                🤖 {Math.min(Number(assignment.max_marks), Math.max(0, sub.ai_estimated_marks))} / {assignment.max_marks}
                              </span>
                              <div>
                                <button
                                  onClick={() => setSelectedSummarySub(sub)}
                                  style={styles.summaryBtn}
                                >
                                  View Summary
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Teacher Final Mark Override / Approve */}
                        <td style={styles.td}>
                          <div style={styles.gradeInputRow}>
                            <input
                              type="number"
                              min={0}
                              max={assignment.max_marks}
                              value={gradeInputs[sub.id] ?? ''}
                              onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                              style={styles.gradeInput}
                              placeholder="Marks"
                            />
                            <button
                              onClick={() => handleSaveGrade(sub.id)}
                              disabled={savingGradeId === sub.id}
                              style={{
                                ...styles.saveGradeBtn,
                                backgroundColor: isApproved ? '#16a34a' : '#2563eb',
                              }}
                            >
                              {savingGradeId === sub.id
                                ? '...'
                                : isApproved
                                ? '✓ Approved'
                                : 'Approve'}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: isApproved
                                ? '#dcfce7'
                                : sub.grading_status === 'AI_ESTIMATED'
                                ? '#e0f2fe'
                                : '#f1f5f9',
                              color: isApproved
                                ? '#15803d'
                                : sub.grading_status === 'AI_ESTIMATED'
                                ? '#0369a1'
                                : '#475569',
                            }}
                          >
                            {isApproved
                              ? 'Teacher Approved'
                              : sub.grading_status === 'AI_ESTIMATED'
                              ? 'AI Estimated'
                              : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Summary Modal Popup */}
        {selectedSummarySub && (
          <div style={styles.modalOverlay} onClick={() => setSelectedSummarySub(null)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, color: '#0f172a' }}>
                  🤖 AI Assessment Summary — {selectedSummarySub.student_name} ({selectedSummarySub.roll_number})
                </h3>
                <button
                  onClick={() => setSelectedSummarySub(null)}
                  style={styles.modalCloseBtn}
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Estimated Mark:</strong>{' '}
                  <span style={{ color: '#2563eb', fontSize: '18px', fontWeight: '800' }}>
                    {selectedSummarySub.ai_estimated_marks} / {assignment.max_marks}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>
                    Summary of Submission:
                  </strong>
                  <p style={{ margin: 0, backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '14px', lineHeight: '1.5' }}>
                    {selectedSummarySub.ai_summary || 'No summary available.'}
                  </p>
                </div>

                {selectedSummarySub.ai_reasoning && (
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>
                      Marking Justification:
                    </strong>
                    <p style={{ margin: 0, backgroundColor: '#eff6ff', padding: '12px', borderRadius: '6px', fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
                      {selectedSummarySub.ai_reasoning}
                    </p>
                  </div>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button
                  onClick={() => setSelectedSummarySub(null)}
                  style={styles.modalDoneBtn}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
  },
  navbar: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '14px 32px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backBtn: {
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
  },
  navTitle: {
    fontSize: '17px',
    fontWeight: '800',
  },
  loadingContainer: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
  },
  main: {
    maxWidth: '1280px',
    margin: '28px auto',
    padding: '0 20px 60px 20px',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    gap: '32px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: '1 1 500px',
  },
  badgesRow: {
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
  deptBadge: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
  },
  collegeBadge: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 16px 0',
  },
  metaGrid: {
    display: 'flex',
    gap: '24px',
    fontSize: '13px',
    color: '#475569',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  metaLabel: {
    color: '#64748b',
  },
  instructionsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px',
  },
  instructionsHeading: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
  },
  instructionsText: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.4',
  },
  questionsBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '12px',
  },
  questionsHeading: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1e293b',
  },
  questionsText: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#1e293b',
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  qrSidebar: {
    width: '240px',
    textAlign: 'center',
    borderLeft: '1px solid #f1f5f9',
    paddingLeft: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrHeading: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    margin: '0 0 12px 0',
  },
  qrImage: {
    width: '180px',
    height: '180px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
  },
  copyBtn: {
    padding: '8px 14px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  qrNote: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: '8px 0 0 0',
    lineHeight: '1.3',
  },
  submissionsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  sectionTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionHeading: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  emptySubmissions: {
    textAlign: 'center',
    padding: '48px',
    color: '#64748b',
  },
  tableCard: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px',
    fontSize: '13px',
    verticalAlign: 'middle',
  },
  fileLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  aiDetectionBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
  },
  aiMarkBadge: {
    display: 'inline-block',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  summaryBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '11px',
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
  },
  gradeInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  gradeInput: {
    width: '56px',
    padding: '6px 8px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    textAlign: 'center',
    outline: 'none',
  },
  saveGradeBtn: {
    padding: '6px 10px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '560px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
  },
  modalBody: {
    fontSize: '14px',
    color: '#334155',
  },
  modalFooter: {
    marginTop: '20px',
    textAlign: 'right',
  },
  modalDoneBtn: {
    padding: '8px 18px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default AssignmentDetail;

