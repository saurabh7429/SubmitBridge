# 23. Actual Implementation Checklist — SubmitBridge

This checklist reflects the verified operational state of every planned and implemented feature in the **SubmitBridge** codebase.

---

## 1. Comprehensive Feature Implementation Matrix

| Feature / Capability | Implemented? | Evidence / File Location | Technical Notes |
| :--- | :---: | :--- | :--- |
| **Faculty Email OTP Registration** | **Implemented** | `server/routes/auth.js` (`/register-initiate`, `/register-verified`), `server/services/emailService.js` | Uses Resend API (with Brevo fallback) to deliver 6-digit OTP to inbox; enforces 60s cooldown timer. |
| **Password Hashing (bcrypt)** | **Implemented** | `server/routes/auth.js` (`bcrypt.hash`, `bcrypt.compare`) | 10 salt rounds used for secure password hashing before storing in `public.teachers`. |
| **Faculty Login (Email & Password)**| **Implemented** | `server/routes/auth.js` (`POST /login`), `client/src/pages/Login.jsx` | Issues a 7-day signed JWT token upon valid credential verification. |
| **Faculty Google OAuth Login** | **Implemented** | `server/routes/auth.js` (`POST /google`), `client/src/pages/Login.jsx` | Supabase OAuth integration; guarded so only already-registered faculty can log in. |
| **1-Click Viva Demo Faculty Login** | **Implemented** | `server/routes/auth.js` (`POST /demo`) | Provides instant demo access to pre-seeded faculty accounts for academic examiners. |
| **JWT Session Validation & Hydration**| **Implemented** | `server/middleware/auth.js`, `client/src/context/AuthContext.jsx` | Hydrates session via `GET /api/auth/me` on initial mount; auto-clears expired sessions. |
| **Teacher Dashboard & Stats Grid** | **Implemented** | `client/src/pages/Dashboard.jsx`, `client/src/components/dashboard/` | Displays live active counts, trash counts, assignment cards, and status pills. |
| **Coursework Creator Form** | **Implemented** | `client/src/pages/CreateAssignment.jsx`, `server/routes/assignments.js` | Captures institution, department, subject, code, title, instructions, max marks, deadline, formats. |
| **Smart Dynamic Question Builder** | **Implemented** | `client/src/pages/CreateAssignment.jsx` (`handleQuestionChange`) | Supports adding/removing questions and automatically splits pasted multi-line text into array items. |
| **Shareable URL & QR Code Generation**| **Implemented** | `server/routes/assignments.js` (`qrcode.toDataURL`), `AssignmentQrCard.jsx` | Generates permanent public URL and high-contrast base64 Data URL QR code. |
| **Student Public Portal Access** | **Implemented** | `client/src/pages/StudentSubmit.jsx`, `server/routes/submissions.js` | Frictionless URL/QR access; displays assignment context, guidelines, and numbered questions. |
| **Student Google Identity Wall** | **Implemented** | `client/src/pages/StudentSubmit.jsx` (`supabase.auth.signInWithOAuth`) | Enforces Google sign-in before file upload to bind student email and prevent anonymous spam. |
| **Automated Deadline Lock** | **Implemented** | `server/routes/submissions.js` (line 120), `client/src/utils/dateUtils.js` | Locks upload form and rejects HTTP submissions if `now > due_date`. |
| **Drag & Drop Document Upload** | **Implemented** | `client/src/components/student/FileDropZone.jsx` | Supports PDF and DOCX formats with instant visual drag-and-drop feedback. |
| **Client-Side File Validation** | **Implemented** | `client/src/pages/StudentSubmit.jsx` (`handleFileSelect`) | Rejects non-PDF/DOCX extensions and files exceeding the 10MB limit before upload. |
| **In-Memory Buffer Ingestion** | **Implemented** | `server/routes/submissions.js` (`multer.memoryStorage()`) | Ingests file buffers directly into RAM without temporary server disk writes. |
| **Supabase Cloud Storage Upload** | **Implemented** | `server/routes/submissions.js` (`supabase.storage.from("submissions").upload`) | Stores files under `{assignment_id}/{roll_number}-{timestamp}.{ext}` in public bucket. |
| **Resubmission Overwrite Rule** | **Implemented** | `server/routes/submissions.js` (lines 162–180, 225–259) | Deletes prior file from Supabase Storage and updates existing database record. |
| **PDF Text Extraction** | **Implemented** | `server/services/aiService.js` (`pdf-parse`) | Dual-mode: standard `pdf-parse` plus custom `zlib` stream decompressor for syntax anomalies. |
| **DOCX Text Extraction** | **Implemented** | `server/services/aiService.js` (`mammoth.extractRawText`) | Converts DOCX XML packages directly into raw text strings. |
| **Text Cleaning & Token Truncation** | **Implemented** | `server/services/aiService.js` (`cleanExtractedText`) | Normalizes whitespace, strips headers, and caps text to ~4,000 characters. |
| **Azure OpenAI Grading Assistant** | **Implemented** | `server/services/aiService.js` (`gradeWithAzureOpenAI`) | Calls `gpt-5-mini` using strict JSON schema; evaluates work in isolation; generates estimated marks. |
| **Marks Boundary Clamping** | **Implemented** | `server/services/aiService.js` (line 263) | Clamps scores strictly within `[0, maxMarks]`: `Math.max(0, Math.min(maxMarks, Math.round(marks)))`. |
| **Sapling AI Content Detection** | **Implemented** | `server/services/aiService.js` (`detectAIContent`) | Queries Sapling AI Detector API; returns percentage score (`0%` to `100%`). |
| **Multi-Key Round-Robin Rotation** | **Implemented** | `server/services/aiService.js` (`saplingKeyIndex` pointer) | Rotates across up to 10 free-tier API keys; automatically tries next key on rate limit error. |
| **Non-Punitive AI Philosophy** | **Implemented** | `server/routes/submissions.js`, `server/services/aiService.js` | AI detection failure never rejects student submissions; defaults safely to `SKIPPED`/`FAILED`. |
| **Submissions Table with Filtering** | **Implemented** | `client/src/components/assignment/SubmissionsTable.jsx` | Includes real-time search (name, roll, email) and status tabs (`All`, `Approved`, `Pending`). |
| **AI Assessment Report Modal** | **Implemented** | `client/src/components/assignment/AISummaryModal.jsx` | Modal dialog displaying estimated AI marks, student work summary, and evaluation justification. |
| **Teacher Final Grade Authority** | **Implemented** | `server/routes/submissions.js` (`PATCH /:id/grade`), `SubmissionRow.jsx` | Faculty can adjust marks and click "Approve" to set status to `TEACHER_APPROVED`. |
| **Export Submissions to CSV** | **Implemented** | `client/src/components/assignment/SubmissionsTable.jsx` (`handleExportCSV`) | Synthesizes table data into a downloadable formatted `.csv` spreadsheet. |
| **Soft Delete & 3-Day Recovery** | **Implemented** | `server/routes/assignments.js` (`DELETE`, `PATCH /restore`), `Dashboard.jsx` | Assignments moved to trash are recoverable for 3 days before auto-purge. |
| **Student Submission History Dashboard**| **Not Implemented**| N/A | Students currently view submission status on the assignment page; no standalone portal. |
| **Email Notification of Final Grade**| **Not Implemented**| N/A | Automated email to students upon teacher mark approval is planned for Phase 2. |
| **Direct PDF Inline Annotations** | **Not Implemented**| N/A | Teacher currently reviews the document via "View Doc" link and inputs marks in table. |
| **Intra-Class Cross Plagiarism** | **Not Implemented**| N/A | AI evaluates submissions in isolation; cross-student similarity matrix planned for Phase 3. |
| **Multi-File Attachments** | **Not Implemented**| N/A | System currently accepts exactly one document (PDF or DOCX) per submission. |
