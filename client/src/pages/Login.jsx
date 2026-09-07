import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginTeacher, demoFacultyLogin, googleFacultyAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Google OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && window.location.hash.includes("access_token")) {
        setGoogleLoading(true);
        try {
          const res = await googleFacultyAuth({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email.split("@")[0],
            collegeName: "",
          });
          login(res.data.token, res.data.teacher);
          navigate("/dashboard");
        } catch (err) {
          setError(err.response?.data?.message || "Google login failed.");
        } finally {
          setGoogleLoading(false);
        }
      }
    };
    handleOAuthCallback();
  }, [login, navigate]);

  const handleGoogleAuth = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const redirectTo = `${window.location.origin}/login`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (authError) setError(authError.message);
    } catch (err) {
      setError("Failed to connect to Google.");
      setGoogleLoading(false);
    }
  };

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
        err.response?.data?.message || "Invalid email or password."
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
      setEmail("vikram.nit@edu.in");
      setPassword("password123");
      try {
        const res = await loginTeacher("vikram.nit@edu.in", "password123");
        login(res.data.token, res.data.teacher);
        navigate("/dashboard");
      } catch (fallbackErr) {
        setError(fallbackErr.response?.data?.message || "Demo sign-in failed.");
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
            Faculty Sign In
          </h1>
        </div>

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

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading || demoLoading}
          className="sb-btn sb-btn-google sb-btn--block"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        <div className="sb-auth-divider">
          <span>OR WITH EMAIL</span>
        </div>

        <form onSubmit={handleSubmit} className="sb-auth-form">
          <div className="sb-form-group">
            <label className="sb-form-label">College Email</label>
            <input
              type="email"
              className="sb-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
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
                placeholder="Password"
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
            disabled={loading || demoLoading || googleLoading}
            className="sb-btn sb-btn-primary sb-btn--lg sb-btn--block"
          >
            {loading ? "Authenticating..." : "Sign In →"}
          </button>
        </form>

        <div className="sb-auth-demo-section">
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading || demoLoading || googleLoading}
            className="sb-btn sb-btn-demo sb-btn--block"
            title="Instant sign in as Prof. Vikram Rao (NIT)"
          >
            <span className="sb-demo-icon">⚡</span>
            <span>
              {demoLoading ? "Connecting..." : "1-Click Viva Demo: Prof. Vikram Rao"}
            </span>
          </button>
        </div>

        <div className="sb-auth-footer">
          <span>Don't have an account? </span>
          <Link to="/register" className="sb-auth-link">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;


