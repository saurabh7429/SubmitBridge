import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

// Login page — teachers enter their email and password here
function Login() {
  // useState hooks to track what the user types in the form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');   // For showing error messages
  const [loading, setLoading]   = useState(false);

  // useNavigate lets us redirect the user programmatically (like window.location but in React)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent the browser from reloading the page
    setError('');
    setLoading(true);

    try {
      // Call the login API function from api.js
      const res = await login(email, password);

      // Store the JWT token in localStorage so we can use it for future API calls
      localStorage.setItem('token', res.data.token);

      // Also store teacher info for displaying the name on the dashboard
      localStorage.setItem('teacher', JSON.stringify(res.data.teacher));

      // Redirect to the dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      // Show the error message returned by the server
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎓 SubmitBridge</h2>
        <h3 style={styles.subtitle}>Teacher Login</h3>

        {/* Show error message if login fails */}
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
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
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Inline Styles ────────────────────────────────────────────────────────────
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
  title: {
    textAlign: 'center',
    marginBottom: '0.25rem',
    color: '#1a1a2e',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#555',
    fontWeight: 'normal',
  },
  error: {
    color: '#e74c3c',
    backgroundColor: '#fdecea',
    padding: '0.5rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  registerText: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#555',
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
  },
};

export default Login;
