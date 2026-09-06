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
    <div className="auth-canvas page-enter">
      <div className="auth-card card-neumorphic">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 className="auth-title">
            Submit<span className="brand-gradient">Bridge</span>
          </h1>
          <p className="auth-subtitle">AI-Powered Faculty Evaluation & Submission Suite</p>
        </div>

        <div className="auth-pill-tag">Faculty Portal Sign In</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">College Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. professor@college.edu"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
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
            className="btn btn-primary btn-glow btn--full btn--lg"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard →"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="auth-link">
            Register Faculty Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
