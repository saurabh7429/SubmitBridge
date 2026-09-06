import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginTeacher } from '../api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginTeacher(email, password);
      // Store token and teacher profile in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('teacher', JSON.stringify(res.data.teacher));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🎓</div>
          <h1 style={styles.title}>SubmitBridge</h1>
          <p style={styles.subtitle}>AI-Powered Assignment Submission Portal</p>
        </div>

        <h2 style={styles.formHeading}>Teacher Login</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>College Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. professor@college.edu"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#0f172a',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '36px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  icon: {
    fontSize: '42px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  formHeading: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#334155',
    margin: '0 0 16px 0',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
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
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b',
    marginTop: '20px',
    marginBottom: 0,
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
  },
};

export default Login;

