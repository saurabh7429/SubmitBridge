import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

// Register page — allows a new teacher to create an account
function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(name, email, password);
      setSuccess('Account created! Redirecting to login...');
      // Redirect to login after a short delay so the user sees the success message
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎓 SubmitBridge</h2>
        <h3 style={styles.subtitle}>Create Teacher Account</h3>

        {error   && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              placeholder="Prof. Ramesh Kumar"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="teacher@college.edu"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              placeholder="Min. 6 characters"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login here</Link>
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
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: { textAlign: 'center', marginBottom: '0.25rem', color: '#1a1a2e' },
  subtitle: { textAlign: 'center', marginBottom: '1.5rem', color: '#555', fontWeight: 'normal' },
  error: {
    color: '#e74c3c', backgroundColor: '#fdecea',
    padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem',
  },
  success: {
    color: '#27ae60', backgroundColor: '#eafaf1',
    padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem',
  },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#333' },
  input: { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  loginText: { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#555' },
  link: { color: '#3498db', textDecoration: 'none' },
};

export default Register;
