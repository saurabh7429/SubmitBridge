import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerTeacher } from "../api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerTeacher(name, email, password, collegeName);
      login(res.data.token, res.data.teacher);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
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
          <p className="sb-auth-subtitle">Join educators streamlining assignment evaluations</p>
        </div>

        <div className="sb-auth-pill-tag">Create Faculty Account</div>

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
            <label className="sb-form-label">Full Name</label>
            <input
              type="text"
              className="sb-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Dr. Sarah Jenkins"
            />
          </div>

          <div className="sb-form-group">
            <label className="sb-form-label">College / Institute Name</label>
            <input
              type="text"
              className="sb-input"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
              placeholder="e.g. Stanford University"
            />
          </div>

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
                minLength={6}
                placeholder="Create password (min 6 chars)"
                autoComplete="new-password"
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
            <span className="sb-form-hint">At least 6 characters required</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sb-btn sb-btn-primary sb-btn--lg sb-btn--block"
          >
            {loading ? "Creating Account..." : "Create Faculty Account →"}
          </button>
        </form>

        <div className="sb-auth-footer">
          <span>Already registered? </span>
          <Link to="/login" className="sb-auth-link">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

