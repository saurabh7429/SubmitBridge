import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAssignment, gradeSubmission } from "../api";

function AssignmentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingGradeId, setSavingGradeId] = useState(null);
  const [selectedSummarySub, setSelectedSummarySub] = useState(null);

  const fetchAssignmentData = async () => {
    try {
      const res = await getAssignment(id);
      setData(res.data);
      const initialGrades = {};
      (res.data.submissions || []).forEach((sub) => {
        initialGrades[sub.id] =
          sub.teacher_final_marks !== null &&
          sub.teacher_final_marks !== undefined
            ? sub.teacher_final_marks
            : sub.ai_estimated_marks !== null &&
              sub.ai_estimated_marks !== undefined
            ? sub.ai_estimated_marks
            : "";
      });
      setGradeInputs(initialGrades);
    } catch (err) {
      setError("Failed to load assignment details.");
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
      navigator.clipboard
        .writeText(link)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        })
        .catch(() => fallbackCopy(link));
    } else {
      fallbackCopy(link);
    }
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-999999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error("Fallback copy failed", e);
    }
    document.body.removeChild(ta);
  };

  const handleGradeChange = (subId, val) =>
    setGradeInputs((prev) => ({ ...prev, [subId]: val }));

  const handleSaveGrade = async (subId) => {
    const val = gradeInputs[subId];
    if (val === "" || isNaN(Number(val))) {
      alert("Please enter a valid numeric mark.");
      return;
    }
    setSavingGradeId(subId);
    try {
      await gradeSubmission(subId, Number(val));
      await fetchAssignmentData();
    } catch (err) {
      alert(
        "Failed to save grade: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSavingGradeId(null);
    }
  };

  // ── Skeleton Loader (Avoids whole-page blanking) ──
  if (loading && !data) {
    return (
      <div className="page-container page-enter">
        <div className="skeleton-line skeleton-line--pill" style={{ width: 140, marginBottom: 20 }} />
        <div className="detail-layout">
          <div className="skeleton-card" style={{ height: 260 }}>
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--text" />
            <div className="skeleton-line skeleton-line--text" style={{ width: '80%' }} />
          </div>
          <div className="skeleton-card" style={{ height: 260 }}>
            <div className="skeleton-line skeleton-line--title" style={{ width: 120 }} />
            <div className="skeleton-line" style={{ height: 160, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container page-enter">
        <div className="card-neumorphic empty-state-card" style={{ textAlign: "center", padding: 40 }}>
          <div className="empty-state__icon">⚠️</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>{error || "Assignment not found."}</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            The assignment may have been permanently removed or the link is invalid.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { assignment, submissions = [], qrCode } = data;
  const isClosed =
    assignment.due_date && new Date() > new Date(assignment.due_date);
  const isDeleted = Boolean(assignment.is_deleted);
  const shareLink =
    assignment.shareable_link ||
    data?.shareableLink ||
    `${window.location.origin}/submit/${id}`;

  return (
    <div className="page-container page-enter">
      {/* ── Breadcrumb Back Navigation ── */}
      <div className="detail-top-bar">
        <Link to="/dashboard" className="btn-back-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* ── Detail Header Grid ── */}
      <div className="detail-hero-grid">
        {/* Left Column: Assignment Details */}
        <div className="detail-card-main card-neumorphic">
          <div className="detail-card-main__header">
            <div className="badge-group">
              <span className="badge badge-indigo">
                {assignment.subject}
                {assignment.subject_code ? ` • ${assignment.subject_code}` : ""}
              </span>
              {assignment.department && (
                <span className="badge badge-gray">{assignment.department}</span>
              )}
              {assignment.college_name && (
                <span className="badge badge-college">{assignment.college_name}</span>
              )}
            </div>

            <div className="status-indicator-box">
              {isDeleted ? (
                <span className="status-pill status-pill--danger">Archived in Trash</span>
              ) : isClosed ? (
                <span className="status-pill status-pill--danger">Submissions Closed</span>
              ) : (
                <span className="status-pill status-pill--success">
                  <span className="pulsing-dot pulsing-dot--green" />
                  Accepting Submissions
                </span>
              )}
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
              <span className="detail-stat__value">
                {new Date(assignment.created_at).toLocaleDateString()}
              </span>
            </div>
            {assignment.due_date && (
              <div className="detail-stat">
                <span className="detail-stat__label">Due Deadline</span>
                <span className={`detail-stat__value ${isClosed ? "text-danger" : ""}`}>
                  {new Date(assignment.due_date).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className="detail-stat">
              <span className="detail-stat__label">Submissions</span>
              <span className="detail-stat__value text-indigo">{submissions.length}</span>
            </div>
          </div>

          {/* Instructions Box */}
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

          {/* Questions Box */}
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

        {/* Right Column: QR Code & Share Portal */}
        <div className="detail-card-qr card-neumorphic">
          <div className="qr-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="5" height="5" x="3" y="3" rx="1"/>
              <rect width="5" height="5" x="16" y="3" rx="1"/>
              <rect width="5" height="5" x="3" y="16" rx="1"/>
              <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
              <path d="M21 21v.01"/>
              <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
              <path d="M3 12h.01"/>
              <path d="M12 3h.01"/>
              <path d="M12 16v.01"/>
              <path d="M16 12h1"/>
              <path d="M21 12v.01"/>
              <path d="M12 21v-1"/>
            </svg>
            <span>Student Submission QR</span>
          </div>

          <div className="qr-wrapper">
            {qrCode ? (
              <img src={qrCode} alt="Student Submission QR Code" className="qr-image" />
            ) : (
              <div className="qr-placeholder">QR Code Unavailable</div>
            )}
          </div>

          <div className="qr-actions">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`btn btn-copy-link ${copied ? "btn-copy-link--copied" : ""}`}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  <span>Copy Student Link</span>
                </>
              )}
            </button>

            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn--sm btn-portal-test"
            >
              <span>Test Student Portal</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>

          <p className="qr-caption">
            Students scan from their smartphones or click the link to submit PDFs/DOCX.
          </p>
        </div>
      </div>

      {/* ── Submissions Table Section ── */}
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
          <div className="empty-state">
            <div className="empty-state__icon">📬</div>
            <h3 className="empty-state__title">No submissions received yet</h3>
            <p className="empty-state__desc">
              Share the QR code or link with your class. Submissions will appear here instantly in real-time.
            </p>
          </div>
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
                {submissions.map((sub, idx) => {
                  const aiScore = sub.ai_detection_score;
                  const isApproved = sub.grading_status === "TEACHER_APPROVED";

                  return (
                    <tr key={sub.id} className="table-row">
                      <td className="cell-muted">{idx + 1}</td>
                      <td className="cell-roll">
                        <strong>{sub.roll_number}</strong>
                      </td>
                      <td className="cell-name">{sub.student_name}</td>
                      <td className="cell-time">
                        {new Date(sub.submitted_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-badge-link"
                          title="Open uploaded file"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span>View Doc</span>
                        </a>
                      </td>

                      {/* AI Detection Score */}
                      <td>
                        {aiScore !== null && aiScore !== undefined ? (
                          <span
                            className={`badge ${
                              aiScore > 50
                                ? "badge-red"
                                : aiScore > 20
                                ? "badge-amber"
                                : "badge-emerald"
                            }`}
                          >
                            {aiScore > 50 ? "⚠️ " : aiScore > 20 ? "⚡ " : "✓ "}
                            {aiScore}% AI
                          </span>
                        ) : (
                          <span className="text-faint-badge">
                            {sub.ai_detection_status === "SKIPPED"
                              ? "Skipped"
                              : "Not Scanned"}
                          </span>
                        )}
                      </td>

                      {/* AI Estimated Mark */}
                      <td>
                        {sub.ai_estimated_marks !== null &&
                        sub.ai_estimated_marks !== undefined ? (
                          <div className="ai-mark-cell">
                            <span className="ai-mark-pill">
                              🤖 {Math.min(
                                Number(assignment.max_marks),
                                Math.max(0, sub.ai_estimated_marks)
                              )} / {assignment.max_marks}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedSummarySub(sub)}
                              className="btn-link-summary"
                            >
                              AI Summary →
                            </button>
                          </div>
                        ) : (
                          <span className="text-faint-badge">Pending</span>
                        )}
                      </td>

                      {/* Teacher Grade Input & Approve */}
                      <td>
                        <div className="grade-action-group">
                          <input
                            type="number"
                            min={0}
                            max={assignment.max_marks}
                            value={gradeInputs[sub.id] ?? ""}
                            onChange={(e) =>
                              handleGradeChange(sub.id, e.target.value)
                            }
                            className="input-grade"
                            placeholder="Pts"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveGrade(sub.id)}
                            disabled={savingGradeId === sub.id}
                            className={`btn btn--sm ${
                              isApproved ? "btn-grade-approved" : "btn-primary"
                            }`}
                          >
                            {savingGradeId === sub.id ? (
                              "..."
                            ) : isApproved ? (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span>Approved</span>
                              </>
                            ) : (
                              "Approve"
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Final Status */}
                      <td>
                        <span
                          className={`badge ${
                            isApproved
                              ? "badge-emerald"
                              : sub.grading_status === "AI_ESTIMATED"
                              ? "badge-indigo"
                              : "badge-gray"
                          }`}
                        >
                          {isApproved
                            ? "Verified"
                            : sub.grading_status === "AI_ESTIMATED"
                            ? "AI Evaluated"
                            : "Submitted"}
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

      {/* ── AI Summary Modal ── */}
      {selectedSummarySub && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSummarySub(null)}
        >
          <div
            className="modal-card card-neumorphic"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-card__header">
              <div className="modal-card__title">
                <span className="modal-icon">🤖</span>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>AI Assessment Report</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {selectedSummarySub.student_name} ({selectedSummarySub.roll_number})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSummarySub(null)}
                className="modal-close-btn"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-card__body">
              <div className="modal-score-banner">
                <span className="modal-score-label">Estimated AI Score</span>
                <span className="modal-score-number">
                  {selectedSummarySub.ai_estimated_marks} <span style={{ fontSize: 16, color: "var(--text-muted)" }}>/ {assignment.max_marks}</span>
                </span>
              </div>

              <div className="modal-section">
                <span className="modal-section__heading">Submission Summary</span>
                <div className="modal-text-block">
                  {selectedSummarySub.ai_summary || "No summary provided by AI evaluator."}
                </div>
              </div>

              {selectedSummarySub.ai_reasoning && (
                <div className="modal-section">
                  <span className="modal-section__heading">Marking Justification & Rationale</span>
                  <div className="modal-text-block modal-text-block--highlight">
                    {selectedSummarySub.ai_reasoning}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-card__footer">
              <button
                type="button"
                onClick={() => setSelectedSummarySub(null)}
                className="btn btn-secondary btn--full"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetail;
