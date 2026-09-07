import React, { useState, useEffect } from 'react';
import { createAssignment } from '../api';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../context/AssignmentsContext';

import BackButton from '../components/common/BackButton';
import FormField from '../components/forms/FormField';
import FileTypeSelector from '../components/forms/FileTypeSelector';
import CreateAssignmentSuccess from '../components/assignment/CreateAssignmentSuccess';

function CreateAssignment() {
  const { teacher } = useAuth();
  const { refreshAssignments } = useAssignments();

  // Form fields
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [allowPdf, setAllowPdf] = useState(true);
  const [allowDocx, setAllowDocx] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);

  useEffect(() => {
    if (teacher?.collegeName) {
      setCollegeName(teacher.collegeName);
    }
  }, [teacher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const types = [];
    if (allowPdf) types.push('pdf');
    if (allowDocx) types.push('docx');
    if (types.length === 0) {
      setError('Please select at least one accepted file format (PDF or DOCX).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        collegeName,
        department,
        subject,
        subjectCode,
        title,
        instructions,
        questions,
        maxMarks: Number(maxMarks),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        allowLateSubmission: false,
        allowedFileTypes: types.join(','),
      };
      const res = await createAssignment(payload);
      setCreatedResult(res.data);
      refreshAssignments(true).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedResult(null);
    setTitle('');
    setInstructions('');
    setQuestions('');
  };

  return (
    <div className="sb-create-assignment-page">
      <BackButton to="/dashboard" label="Back to Dashboard" />

      {!createdResult ? (
        <div className="sb-card sb-create-card">
          <div className="sb-create-header">
            <div className="sb-create-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div>
              <h1 className="sb-create-title">Create New Assignment</h1>
              <p className="sb-create-subtitle">
                Define questions, guidelines, and deadlines. A submission QR code and link will be generated.
              </p>
            </div>
          </div>

          {error && <div className="sb-alert sb-alert--error">{error}</div>}

          <form onSubmit={handleSubmit} className="sb-create-form">
            <div className="sb-form-row-2col">
              <FormField label="Institution / College Name" required>
                <input
                  type="text"
                  className="sb-input"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                  placeholder="e.g. Udhna Citizen College"
                />
              </FormField>

              <FormField label="Department / Stream (Optional)">
                <input
                  type="text"
                  className="sb-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                />
              </FormField>
            </div>

            <div className="sb-form-row-2col">
              <FormField label="Subject Name" required>
                <input
                  type="text"
                  className="sb-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. Operating Systems"
                />
              </FormField>

              <FormField label="Subject Code (Optional)">
                <input
                  type="text"
                  className="sb-input"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. CS-402"
                />
              </FormField>
            </div>

            <FormField label="Assignment Title" required>
              <input
                type="text"
                className="sb-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Assignment 2 — CPU Scheduling & Process Synchronization"
              />
            </FormField>

            <div className="sb-form-row-2col">
              <FormField label="Submission Guidelines & Instructions (Optional)">
                <textarea
                  className="sb-textarea"
                  rows={6}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Maintain academic integrity. Include Gantt charts where appropriate."
                />
              </FormField>

              <FormField label="Assignment Questions / Problems" required>
                <textarea
                  className="sb-textarea"
                  rows={6}
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  required
                  placeholder="1. Compare Preemptive and Non-Preemptive scheduling algorithms.&#10;2. Solve Round Robin with Quantum = 2ms..."
                />
              </FormField>
            </div>

            <div className="sb-form-row-2col">
              <FormField label="Maximum Marks" required>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  className="sb-input"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Due Date & Time (Optional)"
                hint="🔒 Submissions automatically close once deadline expires."
              >
                <input
                  type="datetime-local"
                  className="sb-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </FormField>
            </div>

            <FileTypeSelector
              allowPdf={allowPdf}
              setAllowPdf={setAllowPdf}
              allowDocx={allowDocx}
              setAllowDocx={setAllowDocx}
            />

            <div className="sb-form-submit-row">
              <button
                type="submit"
                disabled={loading}
                className="sb-btn sb-btn-primary sb-btn--lg"
              >
                {loading ? 'Generating Portal & QR...' : 'Create Assignment & Generate QR →'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <CreateAssignmentSuccess result={createdResult} onReset={handleReset} />
      )}
    </div>
  );
}

export default CreateAssignment;
