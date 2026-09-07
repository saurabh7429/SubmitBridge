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
  const [questionsList, setQuestionsList] = useState(['']);
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

  const handleQuestionChange = (index, value) => {
    // If multiple lines pasted at once, split into separate question inputs
    if (value.includes('\n')) {
      const lines = value.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        setQuestionsList((prev) => {
          const updated = [...prev];
          updated.splice(index, 1, ...lines);
          return updated;
        });
        return;
      }
    }
    setQuestionsList((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddQuestion = () => {
    setQuestionsList((prev) => [...prev, '']);
  };

  const handleRemoveQuestion = (index) => {
    setQuestionsList((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

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

    const validQuestions = questionsList
      .map((q) => q.trim())
      .filter(Boolean);

    if (validQuestions.length === 0) {
      setError('Please enter at least one question for this assignment.');
      return;
    }

    const formattedQuestions = validQuestions
      .map((q, idx) => `${idx + 1}. ${q.replace(/^\d+[\.\)]\s*/, '')}`)
      .join('\n');

    setLoading(true);
    try {
      const payload = {
        collegeName,
        department,
        subject,
        subjectCode,
        title,
        instructions,
        questions: formattedQuestions,
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
    setQuestionsList(['']);
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

              <div className="sb-form-group">
                <div className="sb-questions-builder-header">
                  <label className="sb-form-label" style={{ marginBottom: 0 }}>
                    Assignment Questions <span className="sb-text-danger">*</span>
                  </label>
                  <span className="sb-questions-count-badge">
                    {questionsList.filter((q) => q.trim()).length} Question{questionsList.filter((q) => q.trim()).length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="sb-form-hint" style={{ marginTop: 4, marginBottom: 12 }}>
                  Add each assignment question in its own field. Click "+ Add Question" for more.
                </p>

                <div className="sb-questions-builder-list">
                  {questionsList.map((q, idx) => (
                    <div key={idx} className="sb-question-builder-row">
                      <div className="sb-question-num-pill">
                        Q{idx + 1}
                      </div>
                      <input
                        type="text"
                        className="sb-input sb-question-builder-input"
                        value={q}
                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                        required={idx === 0}
                        placeholder={
                          idx === 0
                            ? 'e.g. Compare Preemptive and Non-Preemptive scheduling algorithms.'
                            : idx === 1
                            ? 'e.g. Calculate the turn-around time for given processes.'
                            : `Enter Question ${idx + 1}...`
                        }
                      />
                      {questionsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="sb-question-delete-btn"
                          title="Remove question"
                          aria-label={`Remove question ${idx + 1}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="sb-btn sb-btn-secondary sb-btn--sm sb-btn-add-question"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
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
