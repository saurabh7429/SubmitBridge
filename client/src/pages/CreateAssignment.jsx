import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createAssignment } from '../api';

function CreateAssignment() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);

  // Form fields as defined in PRD Table 2
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [allowPdf, setAllowPdf] = useState(true);
  const [allowDocx, setAllowDocx] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    if (storedTeacher) {
      const parsed = JSON.parse(storedTeacher);
      setTeacher(parsed);
      setCollegeName(parsed.collegeName || '');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prepare allowed file types string
    const types = [];
    if (allowPdf) types.push('pdf');
    if (allowDocx) types.push('docx');
    if (types.length === 0) {
      setError('Please allow at least one file type (PDF or DOCX).');
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
        allowLateSubmission: false, // Strict: once due date passes, submissions close
        allowedFileTypes: types.join(','),
      };

      const res = await createAssignment(payload);
      setCreatedResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (createdResult?.shareableLink) {
      navigator.clipboard.writeText(createdResult.shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <Link to="/dashboard" style={styles.backBtn}>
            ← Dashboard
          </Link>
          <span style={styles.navTitle}>SubmitBridge</span>
        </div>
      </header>

      <main style={styles.main}>
        {createdResult ? (
          /* Assignment Created Success View with QR Code & Link */
          <div style={styles.successCard}>
            <div style={styles.successHeader}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
              <h2 style={styles.successTitle}>Assignment Created Successfully!</h2>
              <p style={styles.successSubtitle}>
                Share this permanent submission link or QR code with your students.
              </p>
            </div>

            <div style={styles.detailsPreview}>
              <h3 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>
                {createdResult.assignment.title}
              </h3>
              <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '14px' }}>
                <strong>Subject:</strong> {createdResult.assignment.subject}
                {createdResult.assignment.subject_code ? ` (${createdResult.assignment.subject_code})` : ''}
              </p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                <strong>Institute:</strong> {createdResult.assignment.college_name} |{' '}
                <strong>Max Marks:</strong> {createdResult.assignment.max_marks}
              </p>
            </div>

            {/* Shareable Link Box */}
            <div style={styles.linkBox}>
              <label style={styles.linkLabel}>📎 Student Submission Link (Public):</label>
              <div style={styles.linkRow}>
                <input
                  type="text"
                  readOnly
                  value={createdResult.shareableLink}
                  style={styles.linkInput}
                />
                <button onClick={handleCopyLink} style={styles.copyBtn}>
                  {copied ? '✅ Copied!' : '📋 Copy Link'}
                </button>
              </div>
            </div>

            {/* QR Code Container */}
            <div style={styles.qrContainer}>
              <p style={styles.qrLabel}>📱 Scan QR Code to Submit on Mobile:</p>
              <img
                src={createdResult.qrCode}
                alt="Submission QR Code"
                style={styles.qrImage}
              />
              <div>
                <a
                  href={createdResult.qrCode}
                  download={`QR-${createdResult.assignment.subject}.png`}
                  style={styles.downloadQrBtn}
                >
                  ⬇️ Download QR Image
                </a>
              </div>
            </div>

            <div style={styles.actionButtons}>
              <button
                onClick={() => {
                  setCreatedResult(null);
                  setTitle('');
                  setQuestions('');
                  setInstructions('');
                }}
                style={styles.createAnotherBtn}
              >
                + Create Another Assignment
              </button>

              <Link
                to={`/assignment/${createdResult.assignment.id}`}
                style={styles.viewDetailBtn}
              >
                View Submissions Dashboard →
              </Link>
            </div>
          </div>
        ) : (
          /* Assignment Creation Form (PRD Table 2) */
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h1 style={styles.heading}>Create New Assignment</h1>
              <p style={styles.subheading}>
                Provide full context so the generated student submission portal is self-explanatory.
              </p>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Institute & Department */}
              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>College / Institute Name *</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                    placeholder="e.g. National Institute of Technology"
                    style={styles.input}
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Department / Program (Optional)</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Row 2: Subject & Subject Code */}
              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Subject Name *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Operating Systems"
                    style={styles.input}
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Subject Code (Optional)</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. CS402"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Row 3: Assignment Title */}
              <div style={styles.field}>
                <label style={styles.label}>Assignment Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Assignment 2 — CPU Scheduling & Semaphores"
                  style={styles.input}
                />
              </div>

              {/* Row 4: Instructions */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Submission Instructions & Guidelines (Optional)
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Include diagrams for Gantt charts. Maintain academic integrity. Late submissions will receive a 10% penalty."
                  style={styles.textarea}
                />
              </div>

              {/* Row 5: Questions */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Assignment Questions / Problem Statements *
                </label>
                <textarea
                  rows={6}
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  required
                  placeholder="1. Compare preemptive and non-preemptive scheduling algorithms.&#10;2. Solve the following Round Robin scheduling problem with quantum = 2ms..."
                  style={styles.textarea}
                />
              </div>

              {/* Row 6: Max Marks & Due Date */}
              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Maximum Marks *</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    required
                    min={1}
                    max={1000}
                    style={styles.input}
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>
                    Due Date & Time {!allowLateSubmission ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={styles.input}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    💡 Agar deadline set ki gayi hai, to date & time cross hote hi submissions automatically band ho jayenge.
                  </span>
                </div>
              </div>

              {/* Row 7: Allowed File Types */}
              <div style={styles.field}>
                <label style={styles.label}>Allowed File Formats</label>
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={allowPdf}
                      onChange={(e) => setAllowPdf(e.target.checked)}
                    />
                    <span>PDF Document (.pdf)</span>
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={allowDocx}
                      onChange={(e) => setAllowDocx(e.target.checked)}
                    />
                    <span>Word Document (.docx)</span>
                  </label>
                </div>
              </div>

              <div style={styles.formFooter}>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Creating Assignment...' : '🚀 Create Assignment & Generate QR'}
                </button>
              </div>
            </form>
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
  main: {
    maxWidth: '840px',
    margin: '32px auto',
    padding: '0 20px 40px 20px',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '36px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  formHeader: {
    marginBottom: '24px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '16px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subheading: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  row: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  col: {
    flex: '1 1 280px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1e293b',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '16px',
    paddingTop: '6px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#334155',
    cursor: 'pointer',
    paddingTop: '6px',
  },
  formFooter: {
    marginTop: '28px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '13px',
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px 32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  successHeader: {
    marginBottom: '24px',
  },
  successTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#166534',
    margin: '0 0 6px 0',
  },
  successSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  detailsPreview: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
    marginBottom: '24px',
  },
  linkBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
    marginBottom: '24px',
  },
  linkLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: '8px',
  },
  linkRow: {
    display: 'flex',
    gap: '10px',
  },
  linkInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #93c5fd',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    outline: 'none',
  },
  copyBtn: {
    padding: '10px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    display: 'inline-block',
    marginBottom: '28px',
  },
  qrLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    margin: '0 0 12px 0',
  },
  qrImage: {
    width: '220px',
    height: '220px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    marginBottom: '12px',
  },
  downloadQrBtn: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#f1f5f9',
    padding: '6px 14px',
    borderRadius: '4px',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  createAnotherBtn: {
    padding: '12px 20px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  viewDetailBtn: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'inline-block',
  },
};

export default CreateAssignment;

