import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAssignments } from '../api';

// Dashboard — shown after teacher logs in
// Displays a list of all their assignments with submission counts
function Dashboard() {
  // State to hold the list of assignments fetched from the server
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const navigate = useNavigate();

  // Get teacher info from localStorage (saved during login)
  const teacher = JSON.parse(localStorage.getItem('teacher') || '{}');

  // useEffect runs once when the component mounts (loads into the page)
  // We fetch the teacher's assignments from the backend here
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await getAssignments();
        setAssignments(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired or invalid — redirect to login
          navigate('/login');
        } else {
          setError('Failed to load assignments.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []); // Empty dependency array means "run this effect only once on mount"

  // Logout: clear localStorage and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('teacher');
    navigate('/login');
  };

  // Format a date string to something readable, e.g., "5 Sep 2024"
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div style={styles.page}>
      {/* Top navigation bar */}
      <nav style={styles.navbar}>
        <h2 style={styles.brand}>🎓 SubmitBridge</h2>
        <div style={styles.navRight}>
          <span style={styles.welcomeText}>Welcome, {teacher.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Page header with "Create New Assignment" button */}
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>My Assignments</h2>
          <Link to="/create" style={styles.createBtn}>+ Create New Assignment</Link>
        </div>

        {loading && <p>Loading assignments...</p>}
        {error   && <p style={styles.error}>{error}</p>}

        {/* If no assignments yet, show a helpful empty state */}
        {!loading && assignments.length === 0 && (
          <div style={styles.emptyState}>
            <p>No assignments yet.</p>
            <p>Click "Create New Assignment" to get started!</p>
          </div>
        )}

        {/* Assignment cards */}
        <div style={styles.grid}>
          {assignments.map((a) => (
            <div key={a._id} style={styles.card}>
              <h3 style={styles.cardTitle}>{a.subject}</h3>
              <p style={styles.cardMeta}>
                📅 Created: {formatDate(a.createdAt)}
              </p>
              <p style={styles.cardMeta}>
                📝 Max Marks: {a.maxMarks}
              </p>
              <p style={styles.cardMeta}>
                📤 Submissions: <strong>{a.submissionCount}</strong>
              </p>
              {/* Link to the assignment detail page */}
              <Link to={`/assignment/${a._id}`} style={styles.viewBtn}>
                View Details →
              </Link>
            </div>
          ))}
        </div>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { margin: 0, fontSize: '1.4rem' },
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  welcomeText: { fontSize: '0.9rem', color: '#ccc' },
  logoutBtn: {
    padding: '0.4rem 0.9rem',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  content: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  pageTitle: { margin: 0 },
  createBtn: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#27ae60',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  error: { color: '#e74c3c' },
  emptyState: { textAlign: 'center', padding: '3rem', color: '#888' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '1.25rem',
    borderRadius: '8px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
  },
  cardTitle: { margin: '0 0 0.75rem 0', color: '#1a1a2e' },
  cardMeta: { margin: '0.3rem 0', color: '#555', fontSize: '0.9rem' },
  viewBtn: {
    display: 'inline-block',
    marginTop: '0.75rem',
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
};

export default Dashboard;
