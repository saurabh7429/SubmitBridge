import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createAssignment } from '../api';

// Create Assignment page — teacher fills in a form to create a new assignment
// After creation, the server returns a shareable link and a QR code
function CreateAssignment() {
  const [subject, setSubject]     = useState('');
  const [questions, setQuestions] = useState('');
  const [maxMarks, setMaxMarks]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  // "result" holds the server response after successful creation (link + QR code)
  const [result, setResult] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send form data to the server to create a new assignment
      const res = await createAssignment({
        subject,
        questions,
        maxMarks: Number(maxMarks),  // Convert string to number
      });

      // Store the result (assignment, link, QR code) to display below the form
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to create assignment.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <Link to="/dashboard" style={styles.backLink}>← Dashboard</Link>
        <h2 style={styles.brand}>🎓 SubmitBridge</h2>
      </nav>

      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Create New Assignment</h2>

        {error && <p style={styles.error}>{error}</p>}

        {/* If assignment was created successfully, show the result */}
        {result ? (
          <div style={styles.successBox}>
            <h3 style={{ color: '#27ae60', marginBottom: '1rem' }}>✅ Assignment Created!</h3>

            <p style={styles.label}>Subject: <strong>{result.assignment.subject}</strong></p>

            <p style={styles.label}>📎 Student Submission Link:</p>
            <div style={styles.linkBox}>
              <a href={result.submissionLink} target="_blank" rel="noreferrer" style={styles.link}>
                {result.submissionLink}
              </a>
            </div>

            <p style={{ marginTop: '1rem' }}>📱 QR Code (students can scan this):</p>
            {/* result.qrCode is a base64 data URL — we can use it directly as img src */}
            <img
              src={result.qrCode}
              alt="QR Code for submission link"
              style={styles.qrImage}
            />

            <div style={styles.actionButtons}>
              <button
                onClick={() => setResult(null)}   // Reset form to create another
                style={styles.newBtn}
              >
                Create Another
              </button>
              <Link to={`/assignment/${result.assignment._id}`} style={styles.detailLink}>
                View Assignment Details →
              </Link>
            </div>
          </div>
        ) : (
          /* Show the form if no assignment has been created yet */
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Subject Name</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={styles.input}
                placeholder="e.g., Data Structures Lab"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Questions / Instructions</label>
              <textarea
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                required
                rows={6}
                style={styles.textarea}
                placeholder="Write the questions or assignment instructions here..."
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Maximum Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                required
                min="1"
                style={{ ...styles.input, maxWidth: '150px' }}
                placeholder="100"
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Creating...' : '🚀 Create Assignment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  navbar: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  backLink: { color: '#ccc', textDecoration: 'none', fontSize: '0.9rem' },
  brand: { margin: 0, fontSize: '1.2rem', color: '#fff' },
  content: { padding: '2rem', maxWidth: '650px', margin: '0 auto' },
  pageTitle: { marginBottom: '1.5rem', color: '#1a1a2e' },
  error: { color: '#e74c3c', backgroundColor: '#fdecea', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' },
  form: {},
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', marginBottom: '0.35rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#333' },
  input: { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
  submitBtn: { padding: '0.75rem 2rem', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  successBox: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
  },
  linkBox: {
    backgroundColor: '#f8f9fa',
    padding: '0.6rem 1rem',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
    wordBreak: 'break-all',
    marginTop: '0.3rem',
  },
  link: { color: '#3498db', fontSize: '0.9rem' },
  qrImage: { border: '1px solid #ddd', borderRadius: '4px', display: 'block', marginTop: '0.5rem' },
  actionButtons: { display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1.5rem' },
  newBtn: { padding: '0.6rem 1.2rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  detailLink: { color: '#3498db', fontWeight: 'bold', textDecoration: 'none' },
};

export default CreateAssignment;
