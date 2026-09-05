import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAssignmentForStudent, submitAssignment } from '../api';

// Student Submission page — students access this via a shared link or QR code
// URL format: /submit/:assignmentId
function StudentSubmit() {
  const { assignmentId } = useParams();  // Get assignmentId from the URL

  const [assignment, setAssignment] = useState(null);   // Assignment details from server
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber]   = useState('');
  const [pdfFile, setPdfFile]         = useState(null);  // The selected PDF file
  const [fileError, setFileError]     = useState('');    // PDF validation error
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');    // Success message after submit

  // Fetch the assignment details when the page loads
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

  // Validate file when student selects it
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    setPdfFile(null);

    if (!file) return;

    // Check that the file is a PDF (check MIME type OR .pdf extension)
    // Note: Some OS/browsers return empty string or non-standard MIME for local files
    const isPdf =
      file.type === 'application/pdf' ||
      file.type === 'application/x-pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setFileError('Only PDF files are accepted. Please choose a .pdf file.');
      e.target.value = '';  // Clear the file input
      return;
    }

    // Check file size — max 10MB (10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller PDF.');
      e.target.value = '';
      return;
    }

    // File is valid — store it in state
    setPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pdfFile) {
      setFileError('Please select a PDF file.');
      return;
    }

    setSubmitting(true);

    try {
      // FormData is used to send file uploads (multipart/form-data)
      // You can't send a File object in regular JSON
      const formData = new FormData();
      formData.append('studentName', studentName);
      formData.append('rollNumber', rollNumber);
      formData.append('pdf', pdfFile);  // 'pdf' must match the field name in multer config

      const res = await submitAssignment(assignmentId, formData);
      setSuccess(res.data.message);  // "Submission successful!" or "Submission updated!"
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render states ──
  if (loading)      return <div style={styles.center}><p>Loading assignment...</p></div>;
  if (!assignment)  return <div style={styles.center}><p style={{ color: '#e74c3c' }}>{error || 'Assignment not found.'}</p></div>;

  return (
    <div style={styles.page}>
      {/* Page header */}
      <header style={styles.header}>
        <h2 style={styles.brand}>🎓 SubmitBridge</h2>
        <p style={styles.headerSubtext}>Assignment Submission Portal</p>
      </header>

      <div style={styles.content}>
        {/* Assignment Info — read-only for students */}
        <div style={styles.assignmentBox}>
          <h2 style={styles.subject}>{assignment.subject}</h2>
          <p style={styles.meta}>📝 Max Marks: {assignment.maxMarks}</p>
          <h4 style={styles.questionsTitle}>Questions / Instructions:</h4>
          <pre style={styles.questions}>{assignment.questions}</pre>
        </div>

        {/* Show success message after submission — hide the form */}
        {success ? (
          <div style={styles.successBox}>
            <h3 style={{ color: '#27ae60' }}>✅ {success}</h3>
            <p>Your assignment has been submitted successfully.</p>
            <p>If you need to resubmit, refresh this page and submit again — your previous submission will be replaced.</p>
          </div>
        ) : (
          /* Submission Form */
          <div style={styles.formBox}>
            <h3 style={styles.formTitle}>Submit Your Assignment</h3>

            {error && <p style={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Your Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="e.g., Rahul Sharma"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="e.g., 21CS045"
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="pdf-upload" style={styles.label}>
                  Upload Assignment PDF
                </label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  required
                  style={styles.fileInput}
                />
                {/* Show file validation error */}
                {fileError && <p style={styles.fileError}>{fileError}</p>}

                {/* Show selected file confirmation */}
                {pdfFile && (
                  <div style={styles.selectedFileBox}>
                    <p style={styles.selectedFileName}>
                      📄 <strong>{pdfFile.name}</strong> ({(pdfFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <span style={styles.readyBadge}>✅ File selected & ready</span>
                  </div>
                )}

                <p style={styles.hint}>Only PDF files (.pdf). Maximum size: 10MB.</p>
              </div>

              <button type="submit" disabled={submitting} style={styles.submitBtn}>
                {submitting ? 'Submitting...' : '📤 Submit Assignment'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  header: {
    backgroundColor: '#1a1a2e', color: '#fff',
    padding: '1.25rem 2rem', textAlign: 'center',
  },
  brand: { margin: 0, fontSize: '1.5rem' },
  headerSubtext: { margin: '0.25rem 0 0 0', color: '#aaa', fontSize: '0.9rem' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  content: { padding: '2rem', maxWidth: '700px', margin: '0 auto' },
  assignmentBox: {
    backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)', marginBottom: '1.25rem',
  },
  subject: { margin: '0 0 0.5rem 0', color: '#1a1a2e' },
  meta: { color: '#555', margin: '0.25rem 0', fontSize: '0.95rem' },
  questionsTitle: { marginTop: '1rem', color: '#333' },
  questions: {
    backgroundColor: '#f8f9fa', border: '1px solid #dee2e6',
    padding: '0.75rem', borderRadius: '4px', whiteSpace: 'pre-wrap',
    fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.5',
  },
  formBox: {
    backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
  },
  formTitle: { marginTop: 0, color: '#1a1a2e', marginBottom: '1rem' },
  error: {
    color: '#e74c3c', backgroundColor: '#fdecea',
    padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem',
  },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', marginBottom: '0.35rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#333' },
  input: { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  fileInput: { display: 'block', marginTop: '0.25rem' },
  fileError: { color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.4rem' },
  hint: { color: '#888', fontSize: '0.8rem', marginTop: '0.3rem' },
  submitBtn: {
    padding: '0.75rem 2rem', backgroundColor: '#3498db', color: '#fff',
    border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer',
  },
  successBox: {
    backgroundColor: '#eafaf1', border: '1px solid #a9dfbf',
    padding: '1.5rem', borderRadius: '8px', textAlign: 'center',
  },
};

export default StudentSubmit;
