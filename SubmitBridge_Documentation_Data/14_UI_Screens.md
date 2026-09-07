# 14. Frontend User Interface Documentation — SubmitBridge

This document details every screen, view, modal, and major UI component implemented in the **SubmitBridge** frontend application.

---

## 1. Summary of Application Screens

| Screen / View Name | Route | Target User | Access Guard | Primary Function |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty Login** | `/login` | Faculty / Evaluators | `PublicAuthRoute` | Email/password login, Google OAuth, 1-Click Viva Demo |
| **Faculty Registration** | `/register` | Unregistered Faculty | `PublicAuthRoute` | Two-phase sign-up: credentials entry & 6-digit email OTP |
| **Teacher Dashboard** | `/dashboard` | Authenticated Faculty | `PrivateRoute` | Summary stats, assignment cards grid, active/trash tabs |
| **Create Assignment** | `/create` | Authenticated Faculty | `PrivateRoute` | Multi-field assignment builder, question list, QR generation |
| **Assignment Details & Grading** | `/assignment/:id` | Authenticated Faculty | `PrivateRoute` | Real-time submissions table, AI evaluation modal, CSV export |
| **Student Submission Gateway** | `/submit/:assignmentId` | College Students | Public + Google Sign-In | Context inspection, Google identity check, PDF/DOCX dropzone |

---

## 2. Screen-by-Screen Technical Specifications

### Screen 1: Faculty Sign In (`Login.jsx`)
- **Route:** `/login`
- **Access Permission:** Public (Redirects to `/dashboard` if already authenticated).
- **Purpose:** Secure entry point for faculty members to access their dashboard.
- **Main UI Elements:**
  - SubmitBridge brand header with graduation cap emblem.
  - "Continue with Google" OAuth button.
  - "OR WITH EMAIL" divider.
  - Email input field (`type="email"`).
  - Password input field (`type="password"`) with an eye icon toggle for show/hide password.
  - Submit button ("Sign In →").
  - Link to registration page ("Don't have an account? Register").
  - Inline error alert box (`sb-alert--error`).
- **Main Actions:**
  - Submit email and password.
  - Trigger Google OAuth popup.
  - Toggle password visibility.
- **Backend APIs Called:**
  - `POST /api/auth/login`
  - `POST /api/auth/google`

---

### Screen 2: Faculty Registration & Email Verification (`Register.jsx`)
- **Route:** `/register`
- **Access Permission:** Public (Redirects to `/dashboard` if authenticated).
- **Purpose:** Onboarding new faculty accounts with strict email ownership verification.
- **Main UI Elements:**
  - **Step 1 (Details Entry):**
    - Full Name input.
    - College / Institution input.
    - College Email input.
    - Password (min 6 characters) and Confirm Password inputs with eye toggles.
    - Submit button ("Verify Email & Register →").
  - **Step 2 (OTP Verification):**
    - Email delivery notification showing recipient email address.
    - Large 6-digit OTP input box (`type="text"`).
    - "Confirm & Access Dashboard →" button.
    - Resend OTP button with a real-time **60-second countdown timer**.
    - "← Edit email address" back navigation link.
- **Main Actions:**
  - Initiate registration and dispatch OTP.
  - Verify OTP code.
  - Resend fresh OTP after cooldown.
- **Backend APIs Called:**
  - `POST /api/auth/register-initiate`
  - `POST /api/auth/register-verified`

---

### Screen 3: Teacher Dashboard (`Dashboard.jsx`)
- **Route:** `/dashboard`
- **Access Permission:** Faculty Only (`PrivateRoute`).
- **Purpose:** Central management overview of all assignments created by the teacher.
- **Main UI Elements:**
  - **Welcome Hero Banner (`DashboardHero.jsx`):** Personalized time-aware greeting ("Good night, Prof. saurabh"), institutional badge, and "+ Create New Assignment" button.
  - **Stats Grid (`StatsGrid.jsx`):** Summary metrics cards displaying Active Assignments count and Archived in Trash count.
  - **Segmented Control Tabs (`SegmentedTabs.jsx`):** Allows switching between "Active Assignments (N)" and "Trash (N)".
  - **Assignment Cards Grid (`AssignmentCard.jsx`):** Cards displaying subject code, department, title, max marks, live submission count, due date, status pill ("Accepting Submissions"), "View Submissions" link, "Copy Link" action, and "Delete Assignment" trash icon.
  - **Empty State Component (`EmptyState.jsx`):** Displays illustrative icon, helpful guidance, and quick action when no assignments exist.
- **Main Actions:**
  - View assignment cards.
  - Copy public assignment link to clipboard.
  - Soft-delete assignment to trash with confirmation modal.
  - Restore soft-deleted assignment from trash.
- **Backend APIs Called:**
  - `GET /api/assignments`
  - `DELETE /api/assignments/:id`
  - `PATCH /api/assignments/:id/restore`

---

### Screen 4: Coursework Creator (`CreateAssignment.jsx`)
- **Route:** `/create` (and alias `/create-assignment`)
- **Access Permission:** Faculty Only (`PrivateRoute`).
- **Purpose:** Interactive coursework design wizard.
- **Main UI Elements:**
  - Navigation back button ("Back to Dashboard").
  - Header with pencil icon, title, and descriptive subtitle.
  - Two-column institutional inputs: College Name and Department.
  - Two-column subject inputs: Subject Name and Subject Code.
  - Assignment Title input.
  - Instructions / Student Guidelines textarea.
  - **Dynamic Question Builder:** Numbered question inputs with "+ Add Question" and remove buttons. Includes smart paste-splitting to automatically turn multi-line text into individual questions.
  - Two-column submission rules: Maximum Marks input and Due Date/Time picker.
  - **File Format Checkboxes (`FileTypeSelector.jsx`):** Toggle PDF and DOCX acceptance.
  - Submit button ("Create Assignment & Generate QR →").
  - **Success Modal (`CreateAssignmentSuccess.jsx`):** Displays high-contrast QR code, permanent link, copy button, and "Go to Assignment Dashboard" button.
- **Main Actions:**
  - Add, remove, and populate questions.
  - Configure deadlines and constraints.
  - Generate submission link and QR code.
- **Backend APIs Called:**
  - `POST /api/assignments`

---

### Screen 5: Assignment Details & Submissions Table (`AssignmentDetail.jsx`)
- **Route:** `/assignment/:id`
- **Access Permission:** Faculty Only (`PrivateRoute`).
- **Purpose:** Comprehensive assignment management and evaluation view.
- **Main UI Elements:**
  - Navigation back button ("Back to Dashboard").
  - **Assignment Header Card (`AssignmentHeaderCard.jsx`):** Displays college, department, subject code, assignment title, max marks, creation date, due deadline, guidelines, and expandable question list.
  - **Student QR Card (`AssignmentQrCard.jsx`):** Displays high-resolution QR code canvas, permanent submission URL, "Copy Student Link" button, and "Test Student Portal" shortcut.
  - **Submissions Table (`SubmissionsTable.jsx`):**
    - Submissions log header showing total submission count.
    - "Export CSV" action button.
    - Search input field (filters across student name, roll number, and email).
    - Status filter pills (`All`, `Approved`, `Pending`).
    - Table columns: `#`, `Roll No.`, `Student Name / Email`, `Submitted At`, `Document ("View Doc")`, `AI Likelihood`, `AI Estimate`, `Final Grade`, `Grading Status`.
  - **AI Summary Modal (`AISummaryModal.jsx`):** Modal dialog presenting estimated marks, 2-3 sentence student summary, and detailed evaluation justification.
- **Main Actions:**
  - Search and filter student submissions.
  - Open and inspect submitted PDF/DOCX files via direct Supabase Storage links.
  - Click "AI Summary →" to inspect AI evaluation rationale.
  - Input custom grade and click "Approve" to finalize score.
  - Export complete submissions log as a `.csv` spreadsheet.
- **Backend APIs Called:**
  - `GET /api/assignments/:id`
  - `PATCH /api/submissions/:id/grade`

---

### Screen 6: Student Submission Portal (`StudentSubmit.jsx`)
- **Route:** `/submit/:assignmentId`
- **Access Permission:** Public (Accessible to any student via link or QR code).
- **Purpose:** Public gateway for students to submit coursework.
- **Main UI Elements:**
  - **Student Header (`StudentHeader.jsx`):** Displays institutional logo, college name, department, and a "Faculty Portal ↗" shortcut.
  - **Student Overview (`StudentOverview.jsx`):** Subject code, instructor name, assignment title, max marks, deadline, submission guidelines, and full question prompt.
  - **Identity Verification Wall:**
    - Displayed if the student is not signed in with Google.
    - Lock icon, descriptive guidance, and large "Continue with Google" button.
  - **Submission Form (Active after sign-in):**
    - Active Google profile badge showing student's name and verified email, with a "Sign out" link.
    - Full Name input field.
    - Roll Number / Student ID input field.
    - **File Dropzone (`FileDropZone.jsx`):** Drag-and-drop target zone, accepted format badge ("Accepted: PDF (Max 10MB)"), and file browser button.
    - Selected file chip showing filename, size in KB/MB, and remove action.
    - "Submit Assignment Now →" button with loading spinner state.
  - **Submission Success View (`SubmissionSuccess.jsx`):**
    - Green checkmark confirmation banner.
    - Student name, roll number, and verified email confirmation.
    - Assigned submission ID.
    - Link to review uploaded document.
    - Notice explaining teacher-in-the-loop review.
- **Main Actions:**
  - Review assignment questions and guidelines.
  - Authenticate identity with Google OAuth.
  - Select and validate PDF or DOCX coursework document.
  - Submit assignment and receive digital confirmation receipt.
- **Backend APIs Called:**
  - `GET /api/submissions/assignment/:assignmentId`
  - `POST /api/submissions/:assignmentId`
