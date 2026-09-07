# 24. Source of Truth & Discrepancy Report — SubmitBridge

This document explains the codebase inspection methodology used to produce this academic documentation, maps out the verified locations of every subsystem, and explicitly details all discrepancies found between the repository's historical `README.md` and the actual, operational codebase.

---

## 1. Codebase Inspection & Verification Summary

The documentation in `SubmitBridge_Documentation_Data` was constructed by directly inspecting and validating the live source code, configuration files, and cloud databases of the project.

### Verified Source Locations:
- **Frontend Source Root:** `c:\Users\msaur\Desktop\github\SubmitBridge\client\`
  - Entry points: `index.html`, `src/index.jsx`, `src/App.jsx`
  - Routes & Views: `src/pages/` (`Login.jsx`, `Register.jsx`, `Dashboard.jsx`, `CreateAssignment.jsx`, `AssignmentDetail.jsx`, `StudentSubmit.jsx`)
  - Modular Components: `src/components/` (`assignment/`, `common/`, `dashboard/`, `forms/`, `layout/`, `student/`)
  - Global State & Caching: `src/context/` (`AuthContext.jsx`, `AssignmentsContext.jsx`)
  - HTTP Client & API Interceptor: `src/api.js`
  - Client Supabase Client: `src/supabaseClient.js`
  - Styling System: `src/styles/global.css`
- **Backend Source Root:** `c:\Users\msaur\Desktop\github\SubmitBridge\server\`
  - Server Bootstrap: `server.js`
  - Supabase Administrative Client: `supabase.js`
  - Security Middleware: `middleware/auth.js`
  - Routing Controllers: `routes/` (`auth.js`, `assignments.js`, `submissions.js`)
  - Service Layer: `services/` (`aiService.js`, `emailService.js`)
- **Database & Storage Layer:**
  - Database Host: Supabase Managed PostgreSQL 17.6 (`ap-south-1`)
  - Tables Inspected: `public.teachers`, `public.assignments`, `public.submissions`
  - Storage Bucket: Supabase Storage (`submissions` public bucket)
- **Live Deployment Environments:**
  - Frontend: `https://submit-bridge.vercel.app/`
  - Backend: `https://submitbridge.onrender.com/`

---

## 2. Discrepancies Between Historical README and Actual Implementation

The repository `README.md` contained several statements that do not reflect the actual, tested source code. In all instances, the actual working source code has been taken as the definitive source of truth.

### Discrepancy 1: Student Login & Authentication Requirement
- **README Claim:**
  > *"Student Submission Portal (No Login Required): Students open the link or scan QR code on their phone/laptop."*
- **Actual Implementation (`StudentSubmit.jsx` & `submissions.js`):**
  - While students do not need a traditional username/password account, **Google OAuth authentication is mandatory** before submitting coursework.
  - `StudentSubmit.jsx` enforces an **Identity Verification Wall**:
    ```javascript
    if (!session) {
      return ( ... "Verify Your Identity: Sign in with your Google account to submit your assignment" ... );
    }
    ```
  - In `server/routes/submissions.js` (lines 86–90):
    ```javascript
    if (!studentEmail) {
      return res.status(400).json({ message: "Google sign-in is required. Student email is missing." });
    }
    ```
  - **Reason for Change:** Enforcing Google OAuth identity verification was added to prevent anonymous spam submissions, bind the student's authentic email to their record, and ensure resubmissions reliably identify the same student.

---

### Discrepancy 2: Resubmission & Overwrite Matching Key
- **README Claim:**
  > *"Submitting again with the same Roll Number for the same assignment replaces the old file in Supabase Storage and updates the existing database record."*
- **Actual Implementation (`submissions.js`, lines 162–180):**
  - Resubmission matching is performed using the student's verified **`student_email`**, not purely the roll number:
    ```javascript
    const { data: existingSubmission } = await supabase
      .from("submissions")
      .select("id, file_path")
      .eq("assignment_id", assignmentId)
      .eq("student_email", studentEmail.toLowerCase().trim())
      .maybeSingle();
    ```
  - **Reason for Change:** Matching by verified Google email prevents malicious actors from entering someone else's roll number to overwrite their legitimate assignment submission.

---

### Discrepancy 3: Faculty Registration & Email OTP Verification
- **README Claim:**
  - The README only mentions standard bcrypt password hashing and JWT authentication, omitting the two-phase email verification workflow.
- **Actual Implementation (`routes/auth.js` & `services/emailService.js`):**
  - Faculty registration requires **6-digit email OTP verification** delivered via transactional email (`Resend` SDK or `Brevo` SMTP).
  - An account is only written to `public.teachers` after the OTP is verified.
  - A 60-second cooldown timer controls OTP resends.

---

### Discrepancy 4: Fallback Text Extraction Engine for PDFs
- **README Claim:**
  - Mentions standard `pdf-parse` for PDFs and `mammoth` for DOCX.
- **Actual Implementation (`services/aiService.js`, lines 12–92):**
  - In addition to `pdf-parse`, a custom stream decompressor (`extractPdfStreamsFallback`) is implemented using Node's native `zlib.inflateSync`. It parses raw binary streams, ASCII85 blocks, and Tj/TJ PDF text operators to extract text from PDFs with syntax anomalies (such as ReportLab quirks).

---

### Discrepancy 5: 1-Click Viva Demo Mode
- **README Claim:**
  - Not documented in the original README.
- **Actual Implementation (`routes/auth.js`, lines 163–204):**
  - Implements `POST /api/auth/demo`, allowing university examiners and viva evaluators to access the platform with one click using pre-seeded faculty credentials (`vikram.nit@edu.in`).

---

### Discrepancy 6: Assignment Trash & 3-Day Recovery Window
- **README Claim:**
  - Not documented in the original README.
- **Actual Implementation (`routes/assignments.js`, lines 136–144, 249–359):**
  - Coursework deletion uses a **soft-delete architecture** (`is_deleted: true`).
  - Assignments are placed in a **Trash** tab for exactly 3 days (72 hours), during which faculty can restore them (`PATCH /api/assignments/:id/restore`).
  - Assignments older than 3 days in trash are automatically purged during dashboard queries.

---

### Discrepancy 7: CSV Spreadsheet Export
- **README Claim:**
  - Not documented in the original README.
- **Actual Implementation (`components/assignment/SubmissionsTable.jsx`, lines 40–63):**
  - Implements client-side synthesis of submission records into a downloadable `.csv` spreadsheet formatted with roll numbers, names, emails, AI scores, and approved final grades.

---

## 3. Conclusion on Source of Truth

The actual source code in `client/` and `server/` contains richer security mechanisms, better academic integrity safeguards (student Google identity requirement), resilient key rotation, and faculty utility tools (CSV export, soft-delete recovery) than originally documented in the initial project README.

All academic documentation in `SubmitBridge_Documentation_Data/` strictly reflects these verified, working implementations.
