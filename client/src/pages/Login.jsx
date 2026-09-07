import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginTeacher, demoFacultyLogin } from "../api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
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
        err.response?.data?.message || "Invalid credentials. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError("");
    setDemoLoading(true);
    try {
      const res = await demoFacultyLogin();
      login(res.data.token, res.data.teacher);
      navigate("/dashboard");
    } catch (err) {
      // Fallback: autofill demo credentials and submit
      setEmail("vikram.nit@edu.in");
      setPassword("password123");
      try {
        const res = await loginTeacher("vikram.nit@edu.in", "password123");
        login(res.data.token, res.data.teacher);
        navigate("/dashboard");
      } catch (fallbackErr) {
        setError(fallbackErr.response?.data?.message || "Demo sign-in failed. Please try manual login.");
      }
    } finally {
      setDemoLoading(false);
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

        {error && (
          <div className="sb-alert sb-alert--error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

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
            <div className="sb-password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="sb-input sb-input--password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="sb-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="sb-btn sb-btn-primary sb-btn--lg sb-btn--block"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard →"}
          </button>
        </form>

        {/* ── Viva / Demo 1-Click Fast Access ── */}
        <div className="sb-auth-demo-section">
          <div className="sb-auth-divider">
            <span>OR QUICK VIVA ACCESS</span>
          </div>
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading || demoLoading}
            className="sb-btn sb-btn-demo sb-btn--block"
            title="Instant 1-click test sign in as Prof. Vikram Rao (NIT)"
          >
            <span className="sb-demo-icon">⚡</span>
            <span>
              {demoLoading ? "Connecting Demo Account..." : "1-Click Viva Demo: Prof. Vikram Rao (NIT)"}
            </span>
          </button>
        </div>

        <div className="sb-auth-footer">
          <div>
            <span>Don't have an account yet? </span>
            <Link to="/register" className="sb-auth-link">
              Register Faculty Account
            </Link>
          </div>
          <div className="sb-auth-portal-switch">
            <span>Are you a student? </span>
            <span className="sb-text-muted">Use the direct assignment link provided by your professor to submit your work.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

