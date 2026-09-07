import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAssignmentForStudent, submitAssignment } from '../api';
import { isOverdue } from '../utils/dateUtils';
import { supabase } from '../supabaseClient';

import StudentHeader from '../components/student/StudentHeader';
import StudentOverview from '../components/student/StudentOverview';
import FileDropZone from '../components/student/FileDropZone';
import SubmissionSuccess from '../components/student/SubmissionSuccess';
import FormField from '../components/forms/FormField';
import EmptyState from '../components/common/EmptyState';

function StudentSubmit() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for OAuth session on mount and after redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Assignment fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await getAssignmentForStudent(assignmentId);
        setAssignment(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Assignment not found, moved to trash, or link is invalid.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleFileSelect = (file) => {
    setFileError('');
    if (!file) return;

    const allowedTypes = assignment?.allowed_file_types || 'pdf';
    const isDocxAllowed = allowedTypes.includes('docx');

    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf' ||
      file.type === 'application/x-pdf';
    const isDocx =
      file.name.toLowerCase().endsWith('.docx') ||
      file.type.includes('wordprocessingml') ||
      file.type.includes('msword');

    if (!isPdf && !(isDocx && isDocxAllowed)) {
      setFileError(
        isDocxAllowed
          ? '⚠️ Only PDF (.pdf) or Word (.docx) documents are accepted.'
          : '⚠️ Only PDF (.pdf) documents are accepted for this assignment.'
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('⚠️ File size exceeds 10MB limit. Please upload a smaller file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!selectedFile) {
      setFileError('Please select an assignment document before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('studentName', studentName.trim());
      formData.append('rollNumber', rollNumber.trim().toUpperCase());
      formData.append('studentEmail', session?.user?.email || '');
      formData.append('file', selectedFile);
      const res = await submitAssignment(assignmentId, formData);
      setSuccessMessage(res.data.message || 'Submission uploaded successfully!');
      setSubmissionResult(res.data.submission || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessMessage('');
    setSubmissionResult(null);
    setSelectedFile(null);
  };

  // ── Loading states ────────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="student-canvas">
        <div className="skeleton-card" style={{ maxWidth: 640, margin: '60px auto', height: 320 }}>
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--text" />
          <div className="skeleton-line" style={{ height: 120, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="student-canvas">
        <div style={{ maxWidth: 500, margin: '60px auto' }}>
          <EmptyState
            icon="🔒"
            title="Submission Portal Unavailable"
            description={error}
          />
        </div>
      </div>
    );
  }

  const deadlinePassed = isOverdue(assignment.due_date);
  const studentEmail = session?.user?.email || '';

  // ── Google Sign-In Wall ───────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="student-canvas">
        <StudentHeader
          collegeName={assignment.college_name}
          department={assignment.department}
        />
        <main className="student-content-container">
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="student-card card-neumorphic" style={{ textAlign: 'center', padding: '48px 40px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                Verify Your Identity
              </h2>
              <p style={{ color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
                Sign in with your Google account to submit your assignment.
                This prevents impersonation and keeps submissions authentic.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="btn btn-primary btn-glow btn--full btn--lg"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
              >
                {/* Google "G" logo */}
                <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.4 38.8 16.2 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C41.8 35.5 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5z"/>
                </svg>
                Sign in with Google
              </button>

              <p style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', opacity: 0.7 }}>
                Your Google account is only used to verify your identity.<br />
                Personal Gmail accounts are accepted.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Authenticated: Main Submission View ───────────────────────────────────────
  return (
    <div className="student-canvas">
      {/* ── Top Header Banner ── */}
      <StudentHeader
        collegeName={assignment.college_name}
        department={assignment.department}
      />

      <main className="student-content-container">
        <div className="student-grid">
          {/* ── Left Column: Assignment Info Overview Card ── */}
          <StudentOverview assignment={assignment} />

          {/* ── Right Column: Form / Confirmation / Deadline Closed ── */}
          <div className="student-form-pane">
            {successMessage ? (
              <SubmissionSuccess
                message={successMessage}
                rollNumber={rollNumber}
                submissionResult={submissionResult}
                onReset={handleReset}
              />
            ) : deadlinePassed ? (
              <div className="student-card card-neumorphic" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>⏰</div>
                <h3 style={{ color: 'var(--danger)', fontSize: 20, marginBottom: 8 }}>
                  Submissions Closed
                </h3>
                <p style={{ color: 'var(--muted)', maxWidth: 440, margin: '0 auto' }}>
                  The deadline for this assignment has expired. New submissions are no longer accepted.
                </p>
              </div>
            ) : (
              <div className="student-card card-neumorphic">
                {/* Signed-in user info + sign out */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--surface-2, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 20,
                  gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {session.user.user_metadata?.avatar_url && (
                      <img
                        src={session.user.user_metadata.avatar_url}
                        alt="avatar"
                        style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session.user.user_metadata?.full_name || 'Google User'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {studentEmail}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="btn btn-secondary btn--sm"
                    style={{ flexShrink: 0, fontSize: 12 }}
                  >
                    Sign out
                  </button>
                </div>

                <h3 className="form-section-title">Submit Your Work</h3>
                <p className="form-section-subtitle">
                  Enter your student details and upload your assignment file.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="student-form">
                  <div className="form-row form-row--2col">
                    <FormField label="Full Name" required>
                      <input
                        type="text"
                        className="form-input"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                        placeholder="e.g. Aryan Sharma"
                      />
                    </FormField>

                    <FormField
                      label="Roll Number / Student ID"
                      required
                      hint="Used to identify your submission."
                    >
                      <input
                        type="text"
                        className="form-input"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        required
                        placeholder="e.g. 21CS042"
                      />
                    </FormField>
                  </div>

                  {/* Upload Dropzone */}
                  <FileDropZone
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    allowedFileTypes={assignment.allowed_file_types}
                    fileError={fileError}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-glow btn--full btn--lg"
                    style={{ marginTop: 12 }}
                  >
                    {submitting ? 'Uploading & Analyzing...' : 'Submit Assignment Now →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentSubmit;
