# 06. API Documentation — SubmitBridge

This document details every RESTful API endpoint implemented in the **SubmitBridge** backend server (`server/server.js`, `server/routes/auth.js`, `server/routes/assignments.js`, `server/routes/submissions.js`).

---

## 1. Global API Standards

- **Base Production URL:** `https://submitbridge.onrender.com/api`
- **Base Local URL:** `http://localhost:5000/api`
- **Data Exchange Format:** `application/json` (except file upload endpoints which consume `multipart/form-data`)
- **Authentication Header:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Error Response Structure:**
  ```json
  {
    "message": "Human readable error explanation.",
    "error": "Optional technical error description"
  }
  ```

---

## 2. Server Root & Health Check

### `GET /`
- **Purpose:** Verifies that the API server is online and operational.
- **Authentication:** None (Public)
- **Frontend Caller:** Deployment monitoring / Ping
- **Request Body:** None
- **Successful Response (HTTP 200):**
  ```json
  {
    "name": "SubmitBridge API",
    "version": "1.0.0",
    "status": "online",
    "database": "Supabase PostgreSQL",
    "storage": "Supabase Storage"
  }
  ```

---

## 3. Authentication & Faculty Management Endpoints (`/api/auth`)

### 1. `POST /api/auth/register-initiate`
- **Purpose:** Initiates the two-step faculty registration process. Verifies email uniqueness, creates an admin verification record, and dispatches a 6-digit OTP code to the teacher's email inbox.
- **Authentication:** None (Public)
- **Frontend Caller:** `client/src/pages/Register.jsx` (Step 1 submission)
- **Request Body:**
  ```json
  {
    "name": "Prof. Jane Doe",
    "collegeName": "State Engineering College",
    "email": "jane.doe@college.edu",
    "password": "SecretPassword123"
  }
  ```
- **External APIs Called:** Supabase Auth Admin API (`supabase.auth.admin.generateLink`), Resend Email API / Brevo SMTP API (`sendOtpEmail`).
- **Successful Response (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Verification code sent to jane.doe@college.edu. Please check your inbox.",
    "emailSent": true
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Name, email, and password are required."}`
  - `400 Bad Request`: `{"message": "This email is already registered. Please sign in."}`
  - `500 Internal Server Error`: `{"message": "Server error during registration."}`

---

### 2. `POST /api/auth/register-verified`
- **Purpose:** Finalizes registration after the 6-digit email OTP has been verified by the client with Supabase. Hashes the password with `bcryptjs` and inserts a new row into `public.teachers`.
- **Authentication:** None (Public)
- **Frontend Caller:** `client/src/pages/Register.jsx` (Step 2 OTP confirmation)
- **Request Body:**
  ```json
  {
    "name": "Prof. Jane Doe",
    "collegeName": "State Engineering College",
    "email": "jane.doe@college.edu",
    "password": "SecretPassword123"
  }
  ```
- **Successful Response (HTTP 201):**
  ```json
  {
    "message": "Registration and email verification successful!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "teacher": {
      "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "name": "Prof. Jane Doe",
      "email": "jane.doe@college.edu",
      "collegeName": "State Engineering College"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Account already exists for this email. Please sign in."}`
  - `500 Internal Server Error`: `{"message": "Failed to create teacher account."}`

---

### 3. `POST /api/auth/login`
- **Purpose:** Standard faculty login using registered email and password.
- **Authentication:** None (Public)
- **Frontend Caller:** `client/src/pages/Login.jsx`
- **Request Body:**
  ```json
  {
    "email": "jane.doe@college.edu",
    "password": "SecretPassword123"
  }
  ```
- **Successful Response (HTTP 200):**
  ```json
  {
    "message": "Login successful!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "teacher": {
      "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "name": "Prof. Jane Doe",
      "email": "jane.doe@college.edu",
      "collegeName": "State Engineering College"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Invalid email or password."}`
  - `400 Bad Request`: `{"message": "Email and password are required."}`

---

### 4. `POST /api/auth/demo`
- **Purpose:** 1-Click Viva Demo Sign-In. Automatically selects an existing demo faculty account (`vikram.nit@edu.in` or primary record) and issues a valid JWT for evaluators.
- **Authentication:** None (Public)
- **Frontend Caller:** Faculty quick-login / examiner demonstration
- **Request Body:** `{}`
- **Successful Response (HTTP 200):**
  ```json
  {
    "message": "Demo login successful!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "teacher": {
      "id": "e8a7c2b1-34df-4198-8923-a1b2c3d4e5f6",
      "name": "Prof. Vikram",
      "email": "vikram.nit@edu.in",
      "collegeName": "NIT Surat"
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `{"message": "No demo faculty account found."}`

---

### 5. `POST /api/auth/google`
- **Purpose:** Faculty Google OAuth sign-in. Validates the Google email from the client OAuth callback against registered faculty in `public.teachers`.
- **Authentication:** None (Public)
- **Frontend Caller:** `client/src/pages/Login.jsx` (Google callback hook)
- **Request Body:**
  ```json
  {
    "email": "faculty.member@gmail.com"
  }
  ```
- **Successful Response (HTTP 200):**
  ```json
  {
    "message": "Google sign-in successful!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "teacher": {
      "id": "b7c2d1e0-84a1-43e9-a298-0c9b8a7d6e5f",
      "name": "Faculty Member",
      "email": "faculty.member@gmail.com",
      "collegeName": "Udhna Citizen College"
    }
  }
  ```
- **Error Responses:**
  - `403 Forbidden`: `{"message": "No faculty account found for faculty.member@gmail.com. Please register with this email first.", "notRegistered": true}`

---

### 6. `GET /api/auth/me`
- **Purpose:** Validates the active session token and retrieves the current teacher's profile.
- **Authentication:** Required (`Bearer <token>`)
- **Frontend Caller:** `client/src/context/AuthContext.jsx` (session hydration)
- **Headers:** `Authorization: Bearer <token>`
- **Successful Response (HTTP 200):**
  ```json
  {
    "teacher": {
      "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "name": "Prof. Jane Doe",
      "email": "jane.doe@college.edu",
      "college_name": "State Engineering College",
      "created_at": "2026-09-06T10:00:00Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"message": "Access denied. No token provided."}` / `{"message": "Invalid or expired token."}`
  - `404 Not Found`: `{"message": "Teacher profile not found."}`

---

## 4. Assignment Management Endpoints (`/api/assignments`)

All routes under `/api/assignments` require teacher authentication via `server/middleware/auth.js`.

### 1. `POST /api/assignments`
- **Purpose:** Creates a new assignment, saves questions, formats the shareable student link, and returns a high-resolution base64 QR code.
- **Authentication:** Required (`Bearer <token>`)
- **Frontend Caller:** `client/src/pages/CreateAssignment.jsx`
- **Request Body:**
  ```json
  {
    "collegeName": "Udhna Citizen College",
    "department": "Computer Applications",
    "subject": "C++ Programming",
    "subjectCode": "CPPM-101",
    "title": "Assignment 1: Object Oriented Concepts",
    "instructions": "Submit code and output screenshots in a single PDF.",
    "questions": ["Explain constructors and destructors", "Write a program demonstrating inheritance"],
    "maxMarks": 20,
    "dueDate": "2026-09-15T18:00:00.000Z",
    "allowLateSubmission": false,
    "allowedFileTypes": "pdf"
  }
  ```
- **Successful Response (HTTP 201):**
  ```json
  {
    "message": "Assignment created successfully!",
    "assignment": {
      "id": "cbc5efc1-57d0-4291-9893-d7f2785bab46",
      "teacher_id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "teacher_name": "Prof. Jane Doe",
      "college_name": "Udhna Citizen College",
      "department": "Computer Applications",
      "subject": "C++ Programming",
      "subject_code": "CPPM-101",
      "title": "Assignment 1: Object Oriented Concepts",
      "instructions": "Submit code and output screenshots in a single PDF.",
      "questions": "1. Explain constructors and destructors\n2. Write a program demonstrating inheritance",
      "max_marks": 20,
      "due_date": "2026-09-15T18:00:00.000Z",
      "allow_late_submission": false,
      "allowed_file_types": "pdf",
      "shareable_link": "https://submit-bridge.vercel.app/submit/cbc5efc1-57d0-4291-9893-d7f2785bab46",
      "is_deleted": false
    },
    "shareableLink": "https://submit-bridge.vercel.app/submit/cbc5efc1-57d0-4291-9893-d7f2785bab46",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Subject name, assignment title, and questions are mandatory."}`
  - `500 Internal Server Error`: `{"message": "Failed to create assignment in database."}`

---

### 2. `GET /api/assignments`
- **Purpose:** Fetches all assignments belonging to the authenticated teacher, automatically purges trash older than 3 days, and attaches exact submission counts.
- **Authentication:** Required (`Bearer <token>`)
- **Frontend Caller:** `client/src/pages/Dashboard.jsx` via `AssignmentsContext`
- **Successful Response (HTTP 200):**
  ```json
  [
    {
      "id": "cbc5efc1-57d0-4291-9893-d7f2785bab46",
      "teacher_id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "college_name": "Udhna Citizen College",
      "subject": "C++ Programming",
      "subject_code": "CPPM-101",
      "title": "Assignment 1: Object Oriented Concepts",
      "max_marks": 20,
      "due_date": "2026-09-15T18:00:00.000Z",
      "submissionCount": 3,
      "is_deleted": false,
      "deleted_at": null
    }
  ]
  ```

---

### 3. `GET /api/assignments/:id`
- **Purpose:** Retrieves full assignment parameters, list of student submissions, and re-generated live QR code for faculty view.
- **Authentication:** Required (`Bearer <token>`)
- **Frontend Caller:** `client/src/pages/AssignmentDetail.jsx`
- **Request Parameters:** `id` (UUID of assignment)
- **Successful Response (HTTP 200):**
  ```json
  {
    "assignment": {
      "id": "cbc5efc1-57d0-4291-9893-d7f2785bab46",
      "title": "Assignment 1: Object Oriented Concepts",
      "max_marks": 20,
      "shareable_link": "https://submit-bridge.vercel.app/submit/cbc5efc1-57d0-4291-9893-d7f2785bab46"
    },
    "shareableLink": "https://submit-bridge.vercel.app/submit/cbc5efc1-57d0-4291-9893-d7f2785bab46",
    "submissions": [
      {
        "id": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
        "student_name": "Saurabh Maurya",
        "roll_number": "21CS042",
        "student_email": "saurabh.student@gmail.com",
        "file_url": "https://cskjibvzpbkehsoiomry.supabase.co/storage/v1/object/public/submissions/cbc5efc1-57d0-4291-9893-d7f2785bab46/21CS042-1788802338641.pdf",
        "submitted_at": "2026-09-07T23:02:00Z",
        "ai_estimated_marks": 16,
        "ai_summary": "Thorough implementation of constructor overloading and single inheritance with neat diagrams.",
        "ai_reasoning": "Complete code snippets provided with execution proof; minor deduction for missing copy constructor.",
        "teacher_final_marks": 17,
        "grading_status": "TEACHER_APPROVED",
        "ai_detection_score": 14,
        "ai_detection_status": "COMPLETED"
      }
    ],
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `{"message": "Assignment not found or unauthorized."}`

---

### 4. `DELETE /api/assignments/:id`
- **Purpose:** Soft-deletes an assignment to trash (`is_deleted: true`). Halts student submissions immediately while keeping data recoverable for 3 days.
- **Authentication:** Required (`Bearer <token>`)
- **Frontend Caller:** `client/src/components/dashboard/AssignmentCard.jsx`
- **Successful Response (HTTP 200):**
  ```json
  {
    "message": "Assignment moved to trash. You can recover it within 3 days.",
    "deletedAt": "2026-09-08T03:00:00.000Z"
  }
  ```

---

### 5. `PATCH /api/assignments/:id/restore`
- **Purpose:** Restores an assignment from trash if within the 72-hour window.
- **Authentication:** Required (`Bearer <token>`)
- **Frontend Caller:** `client/src/components/dashboard/AssignmentCard.jsx`
- **Successful Response (HTTP 200):**
  ```json
  {
    "message": "Assignment restored successfully! Submissions are active again."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "3-day recovery window has expired. This assignment cannot be restored."}`

---

## 5. Student Submissions Endpoints (`/api/submissions`)

### 1. `GET /api/submissions/assignment/:assignmentId`
- **Purpose:** Public endpoint called when a student opens an assignment link or scans the QR code. Returns assignment title, subject, instructions, questions, max marks, and deadline.
- **Authentication:** None (Public)
- **Frontend Caller:** `client/src/pages/StudentSubmit.jsx`
- **Request Parameters:** `assignmentId` (UUID)
- **Successful Response (HTTP 200):**
  ```json
  {
    "id": "cbc5efc1-57d0-4291-9893-d7f2785bab46",
    "college_name": "Udhna Citizen College",
    "department": "CS",
    "teacher_name": "Prof. Jane Doe",
    "subject": "CPPM",
    "subject_code": "101",
    "title": "Assignment 3",
    "instructions": "Submit clean source code and screenshots.",
    "questions": "1. how loops work\n2. explain data types in c++\n3. types of operators in c++",
    "max_marks": 5,
    "due_date": "2026-09-08T12:00:00.000Z",
    "allow_late_submission": false,
    "allowed_file_types": "pdf",
    "is_deleted": false
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `{"message": "Assignment not found or link is invalid."}`
  - `410 Gone`: `{"message": "This assignment has been temporarily disabled or moved to trash by the faculty."}`

---

### 2. `POST /api/submissions/:assignmentId`
- **Purpose:** Student coursework upload endpoint. Receives file and student metadata, verifies deadline and student Google identity, uploads document to Supabase Storage, checks overwrite rule by student email, triggers dual-engine text extraction, invokes Azure OpenAI (`gpt-5-mini`) grading and Sapling AI content detection, and records submission.
- **Authentication:** None (Public - requires `studentEmail` from client Google OAuth session)
- **Frontend Caller:** `client/src/pages/StudentSubmit.jsx`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `studentName` (string, required): Full Name
  - `rollNumber` (string, required): Roll Number
  - `studentEmail` (string, required): Verified Google Email
  - `file` (binary document, required): `.pdf` or `.docx` file (max 10MB)
- **External Services Invoked:**
  - Supabase Storage: `supabase.storage.from("submissions").upload(...)`
  - Azure OpenAI: Chat Completions (`gpt-5-mini`)
  - Sapling AI: Content Detector API (`/v1/aidetect`)
- **Successful Response (HTTP 200):**
  ```json
  {
    "message": "Submission successful! Your assignment has been recorded.",
    "isOverwrite": false,
    "submission": {
      "id": "8b7a6c5d-4e3f-2109-abcd-ef0123456789",
      "studentName": "Saurabh Maurya",
      "rollNumber": "21CS042",
      "studentEmail": "saurabh.student@gmail.com",
      "fileUrl": "https://cskjibvzpbkehsoiomry.supabase.co/storage/v1/object/public/submissions/cbc5efc1-57d0-4291-9893-d7f2785bab46/21CS042-1788802338641.pdf",
      "aiDetectionScore": 14
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Student Name and Roll Number are required."}`
  - `400 Bad Request`: `{"message": "Google sign-in is required. Student email is missing."}`
  - `400 Bad Request`: `{"message": "Please select a valid PDF or DOCX file."}`
  - `400 Bad Request`: `{"message": "The due date & time for this assignment has passed. Submissions are now closed."}`
  - `410 Gone`: `{"message": "This assignment has been deleted by the faculty. Submissions are closed."}`

---

### 3. `PATCH /api/submissions/:id/grade`
- **Purpose:** Teacher finalizes or overrides the AI estimated grade. Updates `teacher_final_marks` and transitions `grading_status` to `'TEACHER_APPROVED'`.
- **Authentication:** Required (`Bearer <token>`)
- **Frontend Caller:** `client/src/components/assignment/SubmissionRow.jsx` ("Approve" button)
- **Request Parameters:** `id` (UUID of submission)
- **Request Body:**
  ```json
  {
    "teacherFinalMarks": 18
  }
  ```
- **Successful Response (HTTP 200):**
  ```json
  {
    "message": "Grade saved and approved successfully!",
    "submission": {
      "id": "8b7a6c5d-4e3f-2109-abcd-ef0123456789",
      "teacher_final_marks": 18,
      "grading_status": "TEACHER_APPROVED",
      "updated_at": "2026-09-08T04:10:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "A valid numeric grade is required."}`
  - `500 Internal Server Error`: `{"message": "Failed to update grade."}`
