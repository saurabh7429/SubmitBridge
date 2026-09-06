import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getAssignmentForStudent, submitAssignment } from "../api";

function StudentSubmit() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await getAssignmentForStudent(assignmentId);
        setAssignment(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Assignment not found, moved to trash, or link is invalid."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  const processFile = (file) => {
    setFileError("");
    if (!file) return;

    const allowedTypes = assignment?.allowed_file_types || "pdf";
    const isDocxAllowed = allowedTypes.includes("docx");

    const isPdf =
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf" ||
      file.type === "application/x-pdf";
    const isDocx =
      file.name.toLowerCase().endsWith(".docx") ||
      file.type.includes("wordprocessingml") ||
      file.type.includes("msword");

    if (!isPdf && !(isDocx && isDocxAllowed)) {
      setFileError(
        isDocxAllowed
          ? "⚠️ Only PDF (.pdf) or Word (.docx) documents are accepted."
          : "⚠️ Only PDF (.pdf) documents are accepted for this assignment."
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError("⚠️ File size exceeds 10MB limit. Please upload a smaller file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
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
    if (file) processFile(file);
  };

  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!selectedFile) {
      setFileError("Please select an assignment document before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("studentName", studentName.trim());
      formData.append("rollNumber", rollNumber.trim().toUpperCase());
      formData.append("file", selectedFile);
      const res = await submitAssignment(assignmentId, formData);
      setSuccessMessage(res.data.message || "Submission uploaded successfully!");
      setSubmissionResult(res.data.submission || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="student-canvas page-enter">
        <div className="skeleton-card" style={{ maxWidth: 640, margin: "60px auto", height: 320 }}>
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--text" />
          <div className="skeleton-line" style={{ height: 120, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  /* Error state */
  if (error && !assignment) {
    return (
      <div className="student-canvas page-enter">
        <div className="student-card card-neumorphic" style={{ textAlign: "center", maxWidth: 500, margin: "60px auto", padding: 40 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontSize: 20, color: "var(--danger)", marginBottom: 8 }}>
            Submission Portal Unavailable
          </h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{error}</p>
        </div>
      </div>
    );
  }

  const isLateClosed =
    assignment.due_date && new Date() > new Date(assignment.due_date);

  return (
    <div className="student-canvas page-enter">
      {/* ── Top Header ── */}
      <header className="student-top-banner">
        <div className="student-banner-inner">
          <div className="student-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span>SubmitBridge Student Portal</span>
          </div>
          <div className="student-institution">
            <h1>{assignment.college_name}</h1>
            {assignment.department && <p>{assignment.department}</p>}
          </div>
        </div>
      </header>

      <main className="student-content-container">
        {/* ── Assignment Info Overview Card ── */}
        <div className="student-card card-neumorphic" style={{ marginBottom: 24 }}>
          <div className="badge-group" style={{ marginBottom: 14 }}>
            <span className="badge badge-indigo">
              {assignment.subject}
              {assignment.subject_code ? ` • ${assignment.subject_code}` : ""}
            </span>
            <span className="badge badge-gray">
              Instructor: <strong>{assignment.teacher_name}</strong>
            </span>
            {isLateClosed && (
              <span className="badge badge-red">⏰ Deadline Expired</span>
            )}
          </div>

          <h2 className="student-card-title">{assignment.title}</h2>

          <div className="student-meta-strip">
            <div className="student-meta-item">
              <span>Maximum Marks:</span>
              <strong>{assignment.max_marks} pts</strong>
            </div>
            {assignment.due_date && (
              <div className="student-meta-item">
                <span>Submission Deadline:</span>
                <strong className={isLateClosed ? "text-danger" : "text-indigo"}>
                  {new Date(assignment.due_date).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </div>
            )}
          </div>

          {assignment.instructions && (
            <div className="info-box info-box--neutral">
              <div className="info-box__title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>Guidelines from Instructor</span>
              </div>
              <p className="info-box__content">{assignment.instructions}</p>
            </div>
          )}

          <div className="info-box info-box--primary" style={{ marginBottom: 0 }}>
            <div className="info-box__title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Assignment Questions</span>
            </div>
            <p className="info-box__content whitespace-pre-line">{assignment.questions}</p>
          </div>
        </div>

        {/* ── Submission Form or Confirmation ── */}
        {successMessage ? (
          <div className="student-card card-neumorphic student-success-box">
            <div className="success-badge">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <h3 className="success-box-title">{successMessage}</h3>
            <p className="success-box-desc">
              Your assignment has been securely uploaded and cataloged under roll number <strong>{rollNumber}</strong>.
            </p>

            {submissionResult?.aiDetectionScore !== null &&
              submissionResult?.aiDetectionScore !== undefined &&
              submissionResult.aiDetectionScore > 50 && (
                <div className="alert alert-error" style={{ textAlign: "left", marginTop: 20 }}>
                  <div>
                    <strong>⚠️ AI Similarity Warning ({submissionResult.aiDetectionScore}% AI Likelihood)</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.5 }}>
                      Automated screening flagged significant AI similarity. You can refine your submission in your own words and re-upload before the deadline.
                    </p>
                  </div>
                </div>
              )}

            <div className="alert alert-info" style={{ textAlign: "left", marginTop: 16 }}>
              💡 <strong>Need to update or re-upload?</strong> You can resubmit anytime before the deadline. Submitting again with the same Roll Number will replace your prior submission.
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage("");
                  setSubmissionResult(null);
                  setSelectedFile(null);
                }}
                className="btn btn-secondary"
              >
                Submit Again / Replace File
              </button>
            </div>
          </div>
        ) : isLateClosed ? (
          <div className="student-card card-neumorphic" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⏰</div>
            <h3 style={{ color: "var(--danger)", fontSize: 20, marginBottom: 8 }}>
              Submissions Closed
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: 440, margin: "0 auto" }}>
              The deadline for this assignment has expired. New submissions are no longer accepted.
            </p>
          </div>
        ) : (
          /* Submission Form */
          <div className="student-card card-neumorphic">
            <h3 className="form-section-title">Submit Your Work</h3>
            <p className="form-section-subtitle">
              Enter your student details and upload your assignment file.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="student-form">
              <div className="form-row form-row--2col">
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    placeholder="e.g. Aryan Sharma"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Roll Number / Student ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                    placeholder="e.g. 21CS042"
                  />
                  <span className="field-hint">
                    Used to identify and update your submission if you re-upload.
                  </span>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="form-group">
                <label className="form-label">
                  Upload Assignment File <span className="text-danger">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    assignment.allowed_file_types?.includes("docx")
                      ? ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      : ".pdf,application/pdf"
                  }
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                <div
                  onClick={triggerFileDialog}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`drop-zone ${isDragging ? "drop-zone--dragging" : ""} ${
                    selectedFile ? "drop-zone--selected" : ""
                  }`}
                >
                  {selectedFile ? (
                    <div className="drop-zone__file-info">
                      <div className="file-icon-badge">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div className="file-name-text">
                        <strong>{selectedFile.name}</strong>
                        <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <span className="badge badge-emerald">✓ File Attached & Ready</span>
                      <p className="file-change-hint">Click or drop another file to replace</p>
                    </div>
                  ) : (
                    <div className="drop-zone__prompt">
                      <div className="upload-icon-circle">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <p className="drop-prompt-title">Click to browse or drag and drop file here</p>
                      <p className="drop-prompt-sub">
                        Accepted: PDF{assignment.allowed_file_types?.includes("docx") ? " or Word (DOCX)" : ""} (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {fileError && <p className="file-error-text">{fileError}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-glow btn--full btn--lg"
                style={{ marginTop: 12 }}
              >
                {submitting ? "Uploading & Analyzing..." : "Submit Assignment Now →"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentSubmit;
