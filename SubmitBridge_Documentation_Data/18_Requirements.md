# 18. Software Requirements Specification (SRS) — SubmitBridge

**Project Title:** SubmitBridge — AI-Assisted Academic Assignment Submission & Evaluation Portal  
**Document Type:** Software Requirements Specification (SRS) for BCA Minor Project  

---

## 1. Functional Requirements

### 1.1 Teacher / Faculty Module
- **FR-T1 (Registration):** The system shall enable faculty members to register using their full name, institution name, official email address, and password.
- **FR-T2 (Email Verification):** The system shall dispatch a 6-digit One-Time Password (OTP) to the faculty member's email inbox to verify ownership before account activation.
- **FR-T3 (Secure Login):** The system shall support faculty login via email and password (authenticated against salted bcrypt hashes), verified Google OAuth, and 1-Click Viva Demo mode.
- **FR-T4 (Dashboard Overview):** The system shall present an interactive dashboard showing summary counts of active assignments and trash archives, alongside cards for each created assignment.
- **FR-T5 (Assignment Creation):** The system shall allow faculty to specify institution name, department, subject, subject code, assignment title, instructions, maximum marks, submission deadline, and allowed file formats (PDF/DOCX).
- **FR-T6 (Dynamic Question Builder):** The system shall provide an expandable question list builder supporting manual additions, deletions, and smart automatic splitting of multi-line pasted questions.
- **FR-T7 (Link & QR Code Generation):** The system shall generate a permanent public submission URL and high-contrast base64 Data URL QR code for every created assignment.
- **FR-T8 (Submission Log Review):** The system shall display all student submissions in a searchable, filterable table with timestamps, student roll numbers, verified emails, and direct file preview links.
- **FR-T9 (AI Assessment Modal):** The system shall allow faculty to open an AI Assessment Report displaying estimated marks, a 2-3 sentence student summary, and detailed evaluation rationale.
- **FR-T10 (Teacher Grade Authority):** The system shall allow faculty to edit the awarded mark and click "Approve" to permanently record the final grade.
- **FR-T11 (Spreadsheet Export):** The system shall export complete assignment submission logs to a formatted `.csv` file.
- **FR-T12 (Soft Deletion & Recovery):** The system shall allow faculty to move assignments to trash, pausing submissions immediately while retaining a 3-day recovery window.

### 1.2 Student Module
- **FR-S1 (Public Gateway Access):** The system shall allow students to access assignments freely via web link or QR code scan without prior account creation.
- **FR-S2 (Context Inspection):** The system shall render the assignment title, instructor name, subject code, max marks, submission deadline, guidelines, and numbered questions.
- **FR-S3 (Identity Verification Wall):** The system shall require students to verify their identity via Google OAuth prior to document upload.
- **FR-S4 (Deadline Enforcement):** The system shall automatically close submissions and lock the upload form once the configured deadline has elapsed.
- **FR-S5 (Drag-and-Drop Ingestion):** The system shall provide a dropzone supporting file selection with immediate client-side validation for file format (PDF/DOCX) and file size (max 10MB).
- **FR-S6 (Resubmission Overwrite):** If a student resubmits using the same verified Google email, the system shall replace their prior file in storage and update their existing database row.
- **FR-S7 (Digital Receipt):** The system shall present an instant confirmation screen displaying the submission ID, uploaded file link, and status confirmation.

### 1.3 AI Pipeline & Evaluation Module
- **FR-AI1 (Text Extraction):** The system shall extract text from student documents in memory using `pdf-parse` (with custom stream inflation fallback) and `mammoth`.
- **FR-AI2 (AI Assisted Evaluation):** The system shall invoke Azure OpenAI (`gpt-5-mini`) to compute estimated marks bounded within `[0, max_marks]`, a summary, and justification.
- **FR-AI3 (AI Content Detection):** The system shall query the Sapling AI Detector API using stateful round-robin key rotation to report AI likelihood percentage.
- **FR-AI4 (Non-Blocking Fault Tolerance):** Third-party AI detection failures or quota limits shall never reject or disrupt a student's coursework submission.

---

## 2. Non-Functional Requirements

### 2.1 Security & Data Integrity
- **NFR-SEC1:** All passwords must be salted and hashed using `bcryptjs` with 10 salt rounds before storage.
- **NFR-SEC2:** Faculty sessions must be secured with JSON Web Tokens (HMAC-SHA256) expiring after 7 days.
- **NFR-SEC3:** Uploaded student files must be buffered strictly in RAM using `multer.memoryStorage()`, eliminating server disk vulnerabilities.
- **NFR-SEC4:** All database queries must be parameterized through the Supabase SDK to prevent SQL injection.
- **NFR-SEC5:** Public client builds must never contain secret keys, API keys, or service-role credentials.

### 2.2 Performance & Responsiveness
- **NFR-PERF1:** Frontend pages must load in under 2 seconds on standard broadband connections via Vercel Edge CDN distribution.
- **NFR-PERF2:** Extracted text must be sanitized and truncated to ~4000 characters to ensure Azure OpenAI completion latency stays below 5 seconds.
- **NFR-PERF3:** File upload processing must complete within 3 seconds for standard 1-5MB academic documents.

### 2.3 Reliability & Availability
- **NFR-REL1:** The system must operate with 99.5% uptime across Vercel, Render, and Supabase cloud infrastructure.
- **NFR-REL2:** Failures in external AI services must fall back gracefully without blocking student submissions.

### 2.4 Usability & Accessibility
- **NFR-USE1:** The user interface must be fully responsive across mobile devices, tablets, and desktop displays.
- **NFR-USE2:** Visual status indicators (Emerald, Amber, Red) must provide intuitive feedback on AI scores and submission statuses.
- **NFR-USE3:** Shimmering loading skeletons and empty state placeholders must guide users during asynchronous operations.

---

## 3. System Requirements & Execution Environment

### 3.1 Hardware Requirements
- **Server / Cloud Container:** Minimum 512 MB RAM, 1 vCPU (Render Web Service).
- **Client Device:** Any standard PC, laptop, tablet, or smartphone with at least 1 GB RAM.

### 3.2 Software & Runtime Requirements
- **Backend Runtime:** Node.js version `18.x` or `20.x` LTS.
- **Package Manager:** `npm` (version 9.x or later).
- **Database Server:** PostgreSQL 14+ (hosted on Supabase PostgreSQL 17.6).
- **Cloud Object Storage:** Supabase Storage (S3-compatible bucket).

### 3.3 Supported Web Browsers
- Google Chrome (version 100+)
- Mozilla Firefox (version 100+)
- Apple Safari (version 15+)
- Microsoft Edge (version 100+)
- Mobile Chrome and Safari on Android and iOS
