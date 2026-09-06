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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
          <p className="auth-subtitle">Join thousands of educators streamlining assignment workflows</p>
        </div>

        <div className="auth-pill-tag">Create Faculty Account</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Dr. Sarah Jenkins"
            />
          </div>

          <div className="form-group">
            <label className="form-label">College / Institute Name</label>
            <input
              type="text"
              className="form-input"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
              placeholder="e.g. Stanford University"
            />
          </div>

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
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-glow btn--full btn--lg"
          >
            {loading ? "Creating Account..." : "Create Faculty Account →"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already registered? </span>
          <Link to="/login" className="auth-link">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
