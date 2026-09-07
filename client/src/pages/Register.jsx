import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { checkEmailAvailability, confirmVerifiedTeacher } from "../api";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Registration step: 'form' | 'verify'
  const [step, setStep] = useState("form");

  // Form inputs
  const [name, setName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status states
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Cooldown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle direct verification link click from email (URL hash contains access_token)
  useEffect(() => {
    const checkEmailLinkAuth = async () => {
      if (window.location.hash.includes("access_token")) {
        setVerifyLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            // Confirm verified teacher in backend
            const storedName = name || session.user.user_metadata?.full_name || session.user.email.split("@")[0];
            const storedCollege = collegeName || session.user.user_metadata?.college_name || "";
            const res = await confirmVerifiedTeacher({
              name: storedName,
              email: session.user.email,
              password: password || "Verified_User_Auth_2026!",
              collegeName: storedCollege,
            });
            login(res.data.token, res.data.teacher);
            navigate("/dashboard");
          }
        } catch (err) {
          setError(err.response?.data?.message || "Email verification failed. Please enter the OTP code manually.");
        } finally {
          setVerifyLoading(false);
        }
      }
    };
    checkEmailLinkAuth();
  }, [login, navigate, name, collegeName, password]);

  // Step 1: Submit Form and send Verification Email
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Check if email is already in database
      await checkEmailAvailability(email);

      // 2. Trigger Supabase verification email / OTP
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            college_name: collegeName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/register`,
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      // 3. Move to OTP Verification screen
      setStep("verify");
      setResendCooldown(60);
      setInfoMessage(`Verification code sent to ${email}. Check your inbox (or spam folder).`);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setVerifyLoading(true);
    try {
      // 1. Verify code with Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanOtp,
        type: "signup",
      });

      if (verifyError) {
        // Also try type 'email' in case Supabase treated it as email confirmation
        const { error: secondAttemptError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: cleanOtp,
          type: "email",
        });
        if (secondAttemptError) {
          throw new Error(verifyError.message || secondAttemptError.message);
        }
      }

      // 2. Persist verified teacher in backend DB and generate JWT session
      const res = await confirmVerifiedTeacher({
        name: name.trim(),
        email: email.trim(),
        password: password,
        collegeName: collegeName.trim(),
      });

      login(res.data.token, res.data.teacher);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Invalid or expired verification code."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setResendLoading(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });
      if (resendError) throw new Error(resendError.message);
      setResendCooldown(60);
      setInfoMessage("A fresh verification code has been sent to your email.");
    } catch (err) {
      setError(err.message || "Failed to resend code. Please try again in a moment.");
    } finally {
      setResendLoading(false);
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
            {step === "form" ? "Faculty Registration" : "Verify Your Email"}
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

        {infoMessage && (
          <div className="sb-alert sb-alert--info" role="status">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ── STEP 1: Details Entry Form ── */}
        {step === "form" ? (
          <form onSubmit={handleInitiateRegister} className="sb-auth-form">
            <div className="sb-form-group">
              <label className="sb-form-label">Full Name</label>
              <input
                type="text"
                className="sb-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full Name"
              />
            </div>

            <div className="sb-form-group">
              <label className="sb-form-label">College / Institute</label>
              <input
                type="text"
                className="sb-input"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
                placeholder="College or University"
              />
            </div>

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
                  minLength={6}
                  placeholder="Password (min 6 chars)"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sb-btn sb-btn-primary sb-btn--lg sb-btn--block"
            >
              {loading ? "Sending Verification Code..." : "Verify Email & Register →"}
            </button>
          </form>
        ) : (
          /* ── STEP 2: OTP Verification Screen ── */
          <form onSubmit={handleVerifyOtp} className="sb-auth-form">
            <div className="sb-otp-notice">
              <div className="sb-otp-icon">✉️</div>
              <p className="sb-otp-text">
                Enter the 6-digit confirmation code sent to:
                <br />
                <strong className="sb-otp-email">{email}</strong>
              </p>
            </div>

            <div className="sb-form-group">
              <label className="sb-form-label">6-Digit Verification Code</label>
              <input
                type="text"
                className="sb-input sb-input--otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                required
                maxLength={6}
                placeholder="123456"
                autoFocus
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={verifyLoading || otp.length < 6}
              className="sb-btn sb-btn-primary sb-btn--lg sb-btn--block"
            >
              {verifyLoading ? "Verifying..." : "Confirm & Access Dashboard →"}
            </button>

            <div className="sb-otp-actions">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                className="sb-btn sb-btn-ghost sb-btn-resend"
              >
                {resendLoading
                  ? "Resending..."
                  : resendCooldown > 0
                  ? `Resend Code in ${resendCooldown}s`
                  : "Resend Verification Code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                  setInfoMessage("");
                }}
                className="sb-btn-text-link"
              >
                ← Edit email address
              </button>
            </div>
          </form>
        )}

        <div className="sb-auth-footer">
          <span>Already registered? </span>
          <Link to="/login" className="sb-auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;



