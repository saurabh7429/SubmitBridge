import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginTeacher } from "../api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginTeacher(email, password);
      login(res.data.token, res.data.teacher);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please verify credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sb-auth-page">
      <div className="sb-card sb-auth-card">
        <div className="sb-auth-header">
          <div className="sb-auth-logo-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 className="sb-auth-title">
            Submit<span className="sb-brand-accent">Bridge</span>
          </h1>
          <p className="sb-auth-subtitle">AI-Powered Faculty Evaluation & Submission Suite</p>
        </div>

        <div className="sb-auth-pill-tag">Faculty Portal Sign In</div>

        {error && <div className="sb-alert sb-alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="sb-auth-form">
          <div className="sb-form-group">
            <label className="sb-form-label">College Email Address</label>
            <input
              type="email"
              className="sb-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. professor@college.edu"
              autoComplete="email"
            />
          </div>

          <div className="sb-form-group">
            <label className="sb-form-label">Password</label>
            <input
              type="password"
              className="sb-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sb-btn sb-btn-primary sb-btn--lg sb-btn--block"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard →"}
          </button>
        </form>

        <div className="sb-auth-footer">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="sb-auth-link">
            Register Faculty Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
