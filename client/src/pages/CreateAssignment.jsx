import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createAssignment } from "../api";
import { useAuth } from "../context/AuthContext";
import { useAssignments } from "../context/AssignmentsContext";

function CreateAssignment() {
  const navigate = useNavigate();
  const { teacher } = useAuth();
  const { refreshAssignments } = useAssignments();

  // Form fields
  const [collegeName, setCollegeName] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [allowPdf, setAllowPdf] = useState(true);
  const [allowDocx, setAllowDocx] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (teacher?.collegeName) {
      setCollegeName(teacher.collegeName);
    }
  }, [teacher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const types = [];
    if (allowPdf) types.push("pdf");
    if (allowDocx) types.push("docx");
    if (types.length === 0) {
      setError("Please select at least one accepted file format (PDF or DOCX).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        collegeName,
        department,
        subject,
        subjectCode,
        title,
        instructions,
        questions,
        maxMarks: Number(maxMarks),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        allowLateSubmission: false,
        allowedFileTypes: types.join(","),
      };
      const res = await createAssignment(payload);
      setCreatedResult(res.data);
      // Silently refresh assignments in cache
      refreshAssignments(true).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create assignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link =
      createdResult?.shareableLink ||
      `${window.location.origin}/submit/${createdResult?.assignment?.id}`;

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

  return (
    <div className="page-container page-enter">
      {/* Back button */}
      <div className="detail-top-bar">
        <Link to="/dashboard" className="btn-back-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {!createdResult ? (
        <div className="create-container">
          <div className="create-card card-neumorphic">
            <div className="create-card__header">
              <div className="create-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="create-card__title">Create New Assignment</h1>
                <p className="create-card__subtitle">
                  Define questions, constraints, and due dates. An instant submission QR code will be generated.
                </p>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="form-grid">
              {/* College & Department */}
              <div className="form-row form-row--2col">
                <div className="form-group">
                  <label className="form-label">
                    Institution / College Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                    placeholder="e.g. Udhna Citizen College"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Stream (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>
              </div>

              {/* Subject & Code */}
              <div className="form-row form-row--2col">
                <div className="form-group">
                  <label className="form-label">
                    Subject Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Operating Systems"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Code (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. CS-402"
                  />
                </div>
              </div>

              {/* Assignment Title */}
              <div className="form-group">
                <label className="form-label">
                  Assignment Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Assignment 2 — CPU Scheduling & Process Synchronization"
                />
              </div>

              {/* Submission Instructions */}
              <div className="form-group">
                <label className="form-label">
                  Submission Instructions & Guidelines (Optional)
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Provide step-by-step Gantt charts. Maintain academic integrity. Hand-written or typed accepted."
                />
              </div>

              {/* Questions / Problem Statements */}
              <div className="form-group">
                <label className="form-label">
                  Assignment Questions / Problem Statements <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  required
                  placeholder="1. Compare Preemptive and Non-Preemptive scheduling algorithms.&#10;2. Solve the following Round Robin problem with Quantum = 2ms..."
                />
              </div>

              {/* Marks & Due Date */}
              <div className="form-row form-row--2col">
                <div className="form-group">
                  <label className="form-label">
                    Maximum Marks <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    className="form-input"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date & Time (Optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <span className="field-hint">
                    🔒 Submissions automatically close once deadline expires.
                  </span>
                </div>
              </div>

              {/* Accepted Formats */}
              <div className="form-group">
                <label className="form-label">Accepted Document Formats</label>
                <div className="format-selection-row">
                  <label className={`format-pill-box ${allowPdf ? "active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={allowPdf}
                      onChange={(e) => setAllowPdf(e.target.checked)}
                    />
                    <span className="format-pill-box__icon">📄</span>
                    <div>
                      <strong>PDF Document (.pdf)</strong>
                      <p>Standard document format for all devices</p>
                    </div>
                  </label>

                  <label className={`format-pill-box ${allowDocx ? "active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={allowDocx}
                      onChange={(e) => setAllowDocx(e.target.checked)}
                    />
                    <span className="format-pill-box__icon">📝</span>
                    <div>
                      <strong>Word Document (.docx)</strong>
                      <p>Microsoft Word document format</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-submit-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-glow btn--lg"
                >
                  {loading ? (
                    <span>Generating Portal & QR...</span>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>Create Assignment & Generate QR</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Success Screen with generated QR and link */
        <div className="create-success-container">
          <div className="card-neumorphic success-card">
            <div className="success-badge">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <h2 className="success-card__title">Assignment Created Successfully!</h2>
            <p className="success-card__desc">
              Your submission portal is ready. Share the QR code or link with your students.
            </p>

            <div className="success-qr-frame">
              {createdResult.qrCode ? (
                <img
                  src={createdResult.qrCode}
                  alt="Student QR Code"
                  className="success-qr-img"
                />
              ) : null}
            </div>

            <div className="share-link-box">
              <input
                type="text"
                readOnly
                value={
                  createdResult.shareableLink ||
                  `${window.location.origin}/submit/${createdResult.assignment?.id}`
                }
                className="share-link-input"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`btn btn-copy-link ${copied ? "btn-copy-link--copied" : ""}`}
              >
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>

            <div className="success-action-btns">
              <Link
                to={`/assignment/${createdResult.assignment?.id}`}
                className="btn btn-primary btn--lg"
              >
                Go to Assignment Submissions →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCreatedResult(null);
                  setTitle("");
                  setInstructions("");
                  setQuestions("");
                }}
                className="btn btn-secondary"
              >
                + Create Another Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateAssignment;
