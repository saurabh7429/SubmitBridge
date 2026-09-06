import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAssignments } from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load cached teacher info from localStorage
    const storedTeacher = localStorage.getItem('teacher');
    if (storedTeacher) {
      setTeacher(JSON.parse(storedTeacher));
    }

    const fetchAssignments = async () => {
      try {
        const res = await getAssignments();
        setAssignments(res.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          setError('Failed to load assignments.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>🎓</span>
          <div>
            <div style={styles.navTitle}>SubmitBridge</div>
            <div style={styles.navCollege}>
              {teacher?.collegeName || 'Faculty Portal'}
            </div>
          </div>
        </div>

        <div style={styles.navUser}>
          <span style={styles.userName}>
            Welcome, <strong>{teacher?.name || 'Professor'}</strong>
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.sectionHeader}>
          <div>
            <h1 style={styles.heading}>My Assignments</h1>
            <p style={styles.subheading}>
              Manage assignments, share student links, and review submissions with AI assistance
            </p>
          </div>
          <Link to="/create" style={styles.createBtn}>
            + Create New Assignment
          </Link>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.emptyState}>
            <p>Loading your assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>No assignments created yet</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '14px' }}>
              Create your first assignment to generate a permanent submission link & QR code for your students.
            </p>
            <Link to="/create" style={styles.createBtn}>
              + Create First Assignment
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {assignments.map((asgn) => (
              <div key={asgn.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.subjectBadge}>
                      {asgn.subject} {asgn.subject_code ? `(${asgn.subject_code})` : ''}
                    </span>
                    {asgn.department && (
                      <span style={styles.deptBadge}>{asgn.department}</span>
                    )}
                  </div>
                  <span style={styles.countBadge}>
                    📥 {asgn.submissionCount || 0} Submitted
                  </span>
                </div>

                <h3 style={styles.cardTitle}>{asgn.title}</h3>

                <div style={styles.cardMeta}>
                  <div style={styles.metaRow}>
                    <span>📝 Max Marks:</span>
                    <strong>{asgn.max_marks}</strong>
                  </div>
                  <div style={styles.metaRow}>
                    <span>📅 Created:</span>
                    <span>{new Date(asgn.created_at).toLocaleDateString()}</span>
                  </div>
                  {asgn.due_date && (
                    <div style={styles.metaRow}>
                      <span>⏰ Due Date:</span>
                      <span style={{ color: '#dc2626', fontWeight: '600' }}>
                        {new Date(asgn.due_date).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <Link to={`/assignment/${asgn.id}`} style={styles.viewBtn}>
                    View Submissions & QR Code →
                  </Link>
                </div>
              </div>
            ))}
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
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLogo: {
    fontSize: '28px',
  },
  navTitle: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.025em',
  },
  navCollege: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  navUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '14px',
    color: '#cbd5e1',
  },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#334155',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subheading: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  createBtn: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    display: 'inline-block',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '8px',
  },
  subjectBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '6px',
    display: 'inline-block',
  },
  deptBadge: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    display: 'inline-block',
  },
  countBadge: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  cardMeta: {
    fontSize: '13px',
    color: '#64748b',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
    marginBottom: '16px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  cardFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
  },
  viewBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    color: '#2563eb',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '60px 24px',
    textAlign: 'center',
    border: '2px dashed #cbd5e1',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
};

export default Dashboard;

