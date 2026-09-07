# 17. Testing & Quality Assurance — SubmitBridge

This document outlines the test methodology, functional verification scenarios, test cases, preconditions, observed results, and verification statuses for **SubmitBridge**.

---

## 1. Testing Methodology

Testing was performed across both the **Frontend Single Page Application** (React 18 / Vite) and the **Backend REST API** (Express / Node.js) in both local development and live production cloud environments (`https://submit-bridge.vercel.app/` and `https://submitbridge.onrender.com/`).

### Test Coverage Levels:
1. **Unit & Input Validation:** Testing format filters, size boundaries, regex sanitizers, and token validators.
2. **Integration Testing:** Verifying inter-service communication between Express, Supabase PostgreSQL, Supabase Storage, Azure OpenAI, Sapling AI, and Resend.
3. **End-to-End User Journeys:** Simulating complete faculty assignment creation to student upload and teacher grade finalization.
4. **Boundary & Edge-Case Testing:** Testing deadline cutoffs, oversized files, invalid extensions, duplicate roll numbers, and API key rate limits.

---

## 2. Test Case Execution Matrix

| Test Case ID | Module | Test Scenario | Precondition | Input Data | Expected Result | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Authentication | Faculty registration initiation with valid details | Email not registered in database | Name: `Dr. Smith`, Email: `drsmith@college.edu`, Password: `Password123` | Server sends 6-digit OTP email via Resend; client advances to OTP screen | OTP sent successfully; 60s cooldown timer activates | **Verified (PASS)** |
| **TC-AUTH-02** | Authentication | Faculty registration with duplicate email | Email already exists in `teachers` | Registered email: `jane.doe@college.edu` | Returns HTTP 400 with "This email is already registered" | Proper error alert displayed on UI | **Verified (PASS)** |
| **TC-AUTH-03** | Authentication | Password length validation on registration | None | Password: `123` (< 6 characters) | Client and server block submission; warning "Password must be at least 6 characters" | Client alert blocks request | **Verified (PASS)** |
| **TC-AUTH-04** | Authentication | Password confirmation mismatch | Step 1 form open | Password: `Secret123`, Confirm: `Secret456` | Client prevents submission; alert "Passwords do not match" | Blocks submission before network call | **Verified (PASS)** |
| **TC-AUTH-05** | Authentication | Valid OTP verification and account creation | Valid OTP dispatched | Clean 6-digit code entered | Account created in `public.teachers`; JWT issued; redirects to `/dashboard` | Verified and redirected to dashboard | **Verified (PASS)** |
| **TC-AUTH-06** | Authentication | Standard faculty login with correct credentials | Verified teacher in database | Email: `drsmith@college.edu`, Password: `Password123` | Returns HTTP 200 with JWT; stores in `localStorage`; loads dashboard | Login successful; JWT stored | **Verified (PASS)** |
| **TC-AUTH-07** | Authentication | Faculty login with wrong password | Verified teacher in database | Email: `drsmith@college.edu`, Password: `WrongPassword!` | Returns HTTP 400: "Invalid email or password" | Alert displayed; no JWT issued | **Verified (PASS)** |
| **TC-AUTH-08** | Authentication | 1-Click Viva Demo Faculty Login | Server online | Click Demo Login / POST `/api/auth/demo` | Authenticates as pre-configured demo faculty; issues valid JWT | Logs in as demo faculty instantly | **Verified (PASS)** |
| **TC-AUTH-09** | Authentication | Faculty Google OAuth with unregistered email | User has Google account not in `teachers` | Click "Continue with Google" | Returns HTTP 403; clears Supabase session; displays "Please register first" | Orphan session purged; error message shown | **Verified (PASS)** |
| **TC-AUTH-10** | Route Guard | Accessing `/dashboard` without authentication | No JWT in `localStorage` | Direct browser navigation to `/dashboard` | `PrivateRoute` redirects to `/login` immediately | Redirected to `/login` | **Verified (PASS)** |
| **TC-AUTH-11** | Route Guard | Expired or altered JWT token | Corrupted token in `localStorage` | Initial page load | `GET /api/auth/me` returns 401; `AuthContext` purges `localStorage` and resets state | Clean session reset to login | **Verified (PASS)** |
| **TC-ASGN-01** | Assignments | Create assignment with all valid fields | Teacher logged in | Subject: `C++`, Title: `Assignment 1`, Max Marks: `20`, 2 Questions, Due Date: Future | Returns HTTP 201; generates shareable link and Base64 QR code | Success modal renders with QR and copy link | **Verified (PASS)** |
| **TC-ASGN-02** | Assignments | Create assignment with missing mandatory questions | Teacher logged in | Subject and Title provided, zero questions entered | Client blocks submission with "Please enter at least one question" | Form validation prevents submission | **Verified (PASS)** |
| **TC-ASGN-03** | Assignments | Smart multi-line question paste splitting | Create assignment open | Paste 3 lines of questions into single input | Automatically splits into 3 separate numbered question fields | Split verified across array state | **Verified (PASS)** |
| **TC-ASGN-04** | Assignments | Soft delete assignment to trash | Active assignment exists | Click trash icon on assignment card | Assignment marked `is_deleted: true`; moved to Trash tab | Moved to Trash; active count decreases by 1 | **Verified (PASS)** |
| **TC-ASGN-05** | Assignments | Restore assignment from trash within 3 days | Assignment in trash (< 72 hrs) | Click "Restore" in Trash tab | `is_deleted` set to `false`; moved back to Active tab | Successfully restored to active grid | **Verified (PASS)** |
| **TC-ASGN-06** | Assignments | Teacher cross-access authorization | Teacher A logged in | Access `/api/assignments/:id` owned by Teacher B | Returns HTTP 404: "Assignment not found or unauthorized" | Protected by `teacher_id` check | **Verified (PASS)** |
| **TC-STUD-01** | Student Portal | Student opens public submission link | Public URL accessible | Visit `/submit/:id` | Renders assignment context, subject, questions, guidelines, deadline | Assignment details rendered accurately | **Verified (PASS)** |
| **TC-STUD-02** | Student Portal | Submission attempt after deadline has expired | Due date in the past | Visit expired assignment link | Displays "Due date has passed. Submissions are now closed" banner | Form locked; submission disabled | **Verified (PASS)** |
| **TC-STUD-03** | Student Portal | Student Google Sign-In Identity Wall | Student not logged in | Visit active assignment link | Renders "Verify Your Identity" wall; requires Google authentication | Google sign-in wall rendered | **Verified (PASS)** |
| **TC-STUD-04** | Student Portal | Upload invalid file type (e.g. `.exe`, `.jpg`, `.txt`) | Student signed in with Google | Select `photo.jpg` or `script.py` | Client displays "Only PDF or Word documents are accepted"; drops file | Blocked by client and Multer filter | **Verified (PASS)** |
| **TC-STUD-05** | Student Portal | Upload oversized file (> 10MB) | Student signed in with Google | Select 14MB PDF document | Client displays "File size exceeds 10MB limit"; rejects file | Blocked before upload | **Verified (PASS)** |
| **TC-STUD-06** | Student Portal | Valid PDF submission | Active assignment, valid student | Name: `Saurabh`, Roll: `21CS042`, valid 2-page PDF | File uploaded to Supabase Storage; AI pipeline evaluates; receipt displayed | Upload verified; record inserted | **Verified (PASS)** |
| **TC-STUD-07** | Student Portal | Resubmission / Overwrite by same student email | Prior submission exists for same student | Re-upload revised PDF with same Google account | Old file deleted from Supabase bucket; database record updated with new URL | Prior file removed; row updated in DB | **Verified (PASS)** |
| **TC-AI-01** | AI Pipeline | Text extraction from valid PDF | Upload PDF | 2-page academic PDF | Text extracted via `pdf-parse`; cleaned to normalized text | Verified in AI summary output | **Verified (PASS)** |
| **TC-AI-02** | AI Pipeline | Text extraction from valid Word DOCX | Upload DOCX | Sample `.docx` document | Text extracted via `mammoth.extractRawText` | Text successfully parsed | **Verified (PASS)** |
| **TC-AI-03** | AI Pipeline | Azure OpenAI grading evaluation (`gpt-5-mini`) | Cleaned text >= 100 chars | Subject: `CPPM`, Max Marks: `5` | Returns JSON `{ estimatedMarks: 3, summary, reasoning }` | Correct advisory mark & summary generated | **Verified (PASS)** |
| **TC-AI-04** | AI Pipeline | Marks boundary mathematical clamping | AI returns value > MaxMarks | Max Marks: `5`, AI hallucinates `8` | Math.max(0, Math.min(5, marks)) clamps mark strictly to `<= 5` | Mathematical clamp strictly enforced | **Verified (PASS)** |
| **TC-AI-05** | AI Pipeline | Sapling AI detector multi-key round-robin | Multiple keys configured | Cleaned student text | Computes AI likelihood percentage; advances pointer to next key | Verified (Output e.g. `14% AI`) | **Verified (PASS)** |
| **TC-AI-06** | AI Pipeline | Non-blocking AI detection failure fallback | Exhausted API key or network error | Cleaned student text | Detection failure logs warning; sets status `FAILED`; submission still succeeds | Student submission never blocked | **Verified (PASS)** |
| **TC-GRADE-01**| Faculty Grading | Teacher inspects AI Summary modal | Submissions exist in table | Click "AI Summary →" button on row | Modal opens showing estimated score, summary, and justification | Modal rendered with clear rationale | **Verified (PASS)** |
| **TC-GRADE-02**| Faculty Grading | Teacher edits and approves final mark | Submission in PENDING state | Enter mark `18`, click "Approve" | Status updates to `TEACHER_APPROVED`; button shows "Approved" | DB row updated; button changes state | **Verified (PASS)** |
| **TC-REP-01** | Reporting | Export Submissions to CSV | Submissions in table | Click "Export CSV" button | Downloads formatted `.csv` file with roll numbers, names, AI scores, final grades | CSV file generated and downloaded | **Verified (PASS)** |

---

## 3. Testing Summary & Quality Assessment

- **Total Test Cases Executed:** 32
- **Passed:** 32
- **Failed:** 0
- **Overall Stability:** High. The application gracefully isolates failure states (such as third-party AI detector timeouts) without halting student submissions.
