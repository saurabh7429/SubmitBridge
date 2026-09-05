import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAssignment } from '../api';

// Assignment Detail page — teacher views full assignment info + all submissions
// :id in the URL is the assignment's MongoDB _id
function AssignmentDetail() {
  const { id } = useParams();   // Extract the assignment ID from the URL (/assignment/:id)
  const navigate = useNavigate();

  const [data, setData]       = useState(null);  // { assignment, submissions, submissionLink, qrCode }
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Server base URL — needed to build PDF view links
  const SERVER_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getAssignment(id);
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Assignment not found.');
        } else {
          setError('Failed to load assignment details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);  // Re-run this effect if the 'id' in the URL changes

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  if (loading) return <div style={styles.center}><p>Loading...</p></div>;
  if (error)   return <div style={styles.center}><p style={{ color: '#e74c3c' }}>{error}</p></div>;

  const { assignment, submissions, submissionLink, qrCode } = data;

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <Link to="/dashboard" style={styles.backLink}>← Dashboard</Link>
        <h2 style={styles.brand}>🎓 SubmitBridge</h2>
      </nav>

      <div style={styles.content}>
        {/* Assignment Info Section */}
        <div style={styles.section}>
          <h2 style={styles.pageTitle}>{assignment.subject}</h2>
          <p style={styles.meta}>📅 Created: {formatDate(assignment.createdAt)}</p>
          <p style={styles.meta}>📝 Max Marks: {assignment.maxMarks}</p>

          <h4 style={styles.subTitle}>Questions / Instructions:</h4>
          <pre style={styles.questions}>{assignment.questions}</pre>
        </div>

        {/* Link & QR Code Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📎 Student Submission Link</h3>
          <div style={styles.linkBox}>
            <a href={submissionLink} target="_blank" rel="noreferrer" style={styles.link}>
              {submissionLink}
            </a>
          </div>

          <h4 style={{ marginTop: '1rem' }}>📱 QR Code:</h4>
          {/* Display the QR code image from the base64 data URL */}
          <img src={qrCode} alt="QR Code" style={styles.qrImage} />
        </div>

        {/* Submissions Table Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            📤 Submissions ({submissions.length})
          </h3>

          {submissions.length === 0 ? (
            <p style={{ color: '#888' }}>No submissions yet.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Student Name</th>
                    <th style={styles.th}>Roll Number</th>
                    <th style={styles.th}>Submitted At</th>
                    <th style={styles.th}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, index) => (
                    <tr key={sub._id} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{sub.studentName}</td>
                      <td style={styles.td}>{sub.rollNumber}</td>
                      <td style={styles.td}>{formatDate(sub.submittedAt)}</td>
                      <td style={styles.td}>
                        {/* Build the URL to view the PDF — the server serves it as a static file */}
                        <a
                          href={`${SERVER_URL}/${sub.pdfPath}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.pdfLink}
                        >
                          View PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  navbar: {
    backgroundColor: '#1a1a2e', color: '#fff', padding: '1rem 2rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  backLink: { color: '#ccc', textDecoration: 'none', fontSize: '0.9rem' },
  brand: { margin: 0, fontSize: '1.2rem', color: '#fff' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  content: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  pageTitle: { margin: '0 0 0.5rem 0', color: '#1a1a2e' },
  meta: { color: '#555', margin: '0.3rem 0', fontSize: '0.95rem' },
  subTitle: { marginTop: '1rem', color: '#333' },
  questions: {
    backgroundColor: '#f8f9fa', border: '1px solid #dee2e6',
    padding: '0.75rem', borderRadius: '4px', whiteSpace: 'pre-wrap',
    fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.5',
  },
  section: {
    backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)', marginBottom: '1.25rem',
  },
  sectionTitle: { marginTop: 0, color: '#1a1a2e' },
  linkBox: {
    backgroundColor: '#f8f9fa', padding: '0.6rem 1rem',
    borderRadius: '4px', border: '1px solid #dee2e6', wordBreak: 'break-all',
  },
  link: { color: '#3498db', fontSize: '0.9rem' },
  qrImage: { border: '1px solid #ddd', borderRadius: '4px', display: 'block', marginTop: '0.5rem' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#1a1a2e', color: '#fff' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 'normal', fontSize: '0.9rem' },
  td: { padding: '0.65rem 1rem', fontSize: '0.9rem', borderBottom: '1px solid #eee' },
  rowEven: { backgroundColor: '#fff' },
  rowOdd: { backgroundColor: '#f8f9fa' },
  pdfLink: { color: '#3498db', textDecoration: 'none', fontWeight: 'bold' },
};

export default AssignmentDetail;
