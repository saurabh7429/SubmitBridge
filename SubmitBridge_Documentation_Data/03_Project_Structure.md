# 03. Project Structure — SubmitBridge

This document outlines the organized source code directory structure of the **SubmitBridge** repository, detailing the architectural role and responsibility of each component, route, context provider, and service.

---

## 1. Complete Source Code Hierarchy

```text
SubmitBridge/
├── client/                               # Frontend Single Page Application (React + Vite)
│   ├── index.html                        # Application HTML shell entry
│   ├── package.json                      # Frontend dependencies and Vite build scripts
│   ├── vercel.json                       # Vercel SPA routing and URL rewrite configuration
│   ├── vite.config.js                    # Vite dev server configuration & /api proxy target
│   └── src/
│       ├── index.jsx                     # React DOM root render entry
│       ├── App.jsx                       # Primary application router & route guards
│       ├── api.js                        # Centralized Axios instance with auth interceptors
│       ├── supabaseClient.js             # Public browser Supabase client (anon key)
│       ├── components/                   # Modular reusable React UI components
│       │   ├── assignment/               # Assignment detail & submission review components
│       │   │   ├── AISummaryModal.jsx    # Modal dialog for AI evaluation score & rationale
│       │   │   ├── AssignmentHeaderCard.jsx # Header card with assignment metadata & badges
│       │   │   ├── AssignmentQrCard.jsx  # QR code canvas card with link copy action
│       │   │   ├── CreateAssignmentSuccess.jsx # Post-creation confirmation with QR & link
│       │   │   ├── SubmissionRow.jsx     # Individual student row in grading table
│       │   │   └── SubmissionsTable.jsx  # Filterable, searchable table with CSV export
│       │   ├── common/                   # Global atomic UI elements
│       │   │   ├── BackButton.jsx        # Navigation back button
│       │   │   ├── Badge.jsx             # Categorical status badge (emerald, indigo, red, etc.)
│       │   │   ├── CopyButton.jsx        # Clipboard copy action with checkmark animation
│       │   │   ├── EmptyState.jsx        # Illustrative placeholder for zero-data states
│       │   │   ├── LoadingSkeleton.jsx   # Shimmering loading skeletons for cards and details
│       │   │   ├── Modal.jsx             # Accessible backdrop & modal window wrapper
│       │   │   └── StatusPill.jsx        # Compact pill component for assignment lifecycle
│       │   ├── dashboard/                # Faculty dashboard widgets
│       │   │   ├── AssignmentCard.jsx    # Assignment card with metrics, link, delete & restore
│       │   │   ├── DashboardHero.jsx     # Welcome banner with faculty greeting
│       │   │   ├── SegmentedTabs.jsx     # Tab selector for Active vs. Trash assignments
│       │   │   └── StatsGrid.jsx         # Summary cards displaying active and trash counts
│       │   ├── forms/                    # Controlled form building blocks
│       │   │   ├── FileTypeSelector.jsx  # PDF / DOCX format toggle checkboxes
│       │   │   └── FormField.jsx         # Label, validation message, and input wrapper
│       │   ├── layout/                   # Structural page shell components
│       │   │   ├── Layout.jsx            # Persistent outer shell housing Navbar and Outlet
│       │   │   └── Navbar.jsx            # Top navigation header with faculty profile & logout
│       │   └── student/                  # Public student gateway components
│       │       ├── FileDropZone.jsx      # Drag-and-drop file upload target with validation
│       │       ├── StudentHeader.jsx     # Institutional header banner for students
│       │       ├── StudentOverview.jsx   # Assignment context, guidelines, and question list
│       │       └── SubmissionSuccess.jsx # Post-submission receipt screen
│       ├── context/                      # React Context providers for global state
│       │   ├── AssignmentsContext.jsx    # Cache & state management for teacher's assignments
│       │   └── AuthContext.jsx           # Faculty session hydration, login, and logout state
│       ├── pages/                        # Primary top-level route views
│       │   ├── AssignmentDetail.jsx      # Detailed submissions log, grading table & QR
│       │   ├── CreateAssignment.jsx      # Coursework builder form with dynamic questions
│       │   ├── Dashboard.jsx             # Teacher home view with assignment cards
│       │   ├── Login.jsx                 # Faculty sign-in (Password, Google, Demo)
│       │   ├── Register.jsx              # Faculty sign-up with 6-digit email OTP flow
│       │   └── StudentSubmit.jsx         # Public student upload portal with Google identity
│       ├── styles/
│       │   └── global.css                # Centralized CSS design system (tokens, utilities)
│       └── utils/
│           └── dateUtils.js              # Date formatting, relative time & overdue check
│
├── server/                               # Backend REST API Application (Node.js + Express)
│   ├── package.json                      # Backend dependencies and run scripts
│   ├── server.js                         # Express application entry, middleware, health check
│   ├── supabase.js                       # Supabase client singleton (Service Role / Anon Key)
│   ├── middleware/
│   │   └── auth.js                       # Express middleware verifying JWT Bearer token
│   ├── routes/
│   │   ├── assignments.js                # Assignment CRUD, QR generation, soft-delete & restore
│   │   ├── auth.js                       # Faculty auth, registration OTP, Google, Demo login
│   │   └── submissions.js                # Public student submissions, file storage & grading
│   └── services/
│       ├── aiService.js                  # PDF/DOCX parsing, Azure OpenAI, Sapling AI detection
│       └── emailService.js               # Resend SDK & Brevo SMTP integration for OTP delivery
│
├── .env.example                          # Environment variable template for developers
├── GEMINI.md                             # Project development and MCP guidance rules
└── README.md                             # Overview documentation
```

---

## 2. Core Frontend Files & Responsibilities

### Root and Navigation
- **`client/src/App.jsx`**: Configures client-side routing via `BrowserRouter`, `Routes`, and `Route`. Houses route security guards:
  - `PrivateRoute`: Validates faculty authentication token; displays full-screen spinner during verification. Redirects unauthenticated requests to `/login`.
  - `PublicAuthRoute`: Prevents authenticated faculty from visiting `/login` or `/register`, forwarding them to `/dashboard`.
- **`client/src/api.js`**: Central Axios client configured with automatic base URL detection (local dev proxy `/api` vs. production `VITE_API_URL`). Interceptors automatically attach `Bearer <token>` from `localStorage` to all authenticated requests.
- **`client/src/supabaseClient.js`**: Initializes the browser-safe Supabase SDK client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to support client-side Google OAuth popups and session listeners.

### State Management (`client/src/context/`)
- **`AuthContext.jsx`**: Provides `useAuth()` hook. Initializes session state from `localStorage` (`token` and `teacher`). Automatically contacts `GET /api/auth/me` on initial mount to validate the session against the backend and purge expired tokens. Exposes `login()`, `logout()`, `teacher`, and `isAuthenticated`.
- **`AssignmentsContext.jsx`**: Provides `useAssignments()` hook. Serves as a client-side cache for assignments and their associated submission details. Prevents redundant database queries while providing a `refreshAssignments(force)` method to invalidate cache after mutations (creation, deletion, restoration, grading).

### Page Components (`client/src/pages/`)
- **`Login.jsx`**: Faculty sign-in interface. Supports email/password login, Google OAuth callback listener (`#access_token`), error alerts, password visibility toggle, and redirect to dashboard.
- **`Register.jsx`**: Two-step registration wizard. Step 1 collects faculty name, college, email, password, and confirmation; initiates backend OTP generation. Step 2 presents the 6-digit OTP verification input with a 60-second cooldown resend timer.
- **`Dashboard.jsx`**: Faculty control hub. Features a welcome banner, summary stat widgets (Active vs. Trash counts), segmented tab switcher, empty states, and grid of assignment cards. Handles soft-delete confirmation and restore triggers.
- **`CreateAssignment.jsx`**: Full-fledged assignment design form. Handles institution name, department, subject, subject code, title, instructions, dynamic multi-question builder (supporting multi-line paste splitting), max marks, due date picker, and file format toggles. Renders `CreateAssignmentSuccess` modal with QR code upon submission.
- **`AssignmentDetail.jsx`**: Main evaluation view for an assignment. Renders assignment metadata header, QR code card, searchable/filterable submissions table, inline grading inputs, and opens the AI summary modal.
- **`StudentSubmit.jsx`**: Public student submission gateway. Displays institutional badge, subject, questions, guidelines, and live deadline status. Enforces a Google Sign-In verification wall, provides drag-and-drop document upload, validates file type and 10MB size limit, and handles resubmission replacement.

---

## 3. Core Backend Files & Responsibilities

### Server Setup & Client Singletons
- **`server/server.js`**: Primary Express application entry point. Configures `cors({ origin: true, credentials: true })`, JSON body parsing, URL-encoded body parsing, registers route modules (`/api/auth`, `/api/assignments`, `/api/submissions`), provides a root health check (`GET /`), and includes a global error handler middleware.
- **`server/supabase.js`**: Initializes a singleton Supabase client using `@supabase/supabase-js`. Normalizes URLs, attaches `SUPABASE_SERVICE_ROLE_KEY` (or fallback `SUPABASE_ANON_KEY`) with disabled session persistence for server queries.
- **`server/middleware/auth.js`**: Middleware function inspecting the `Authorization` request header. Extracts the Bearer JWT token, validates its signature and expiration using `jsonwebtoken` and `JWT_SECRET`, and attaches the decoded teacher payload (`id`, `name`, `email`, `collegeName`) to `req.teacher`. Returns HTTP 401 on missing or invalid tokens.

### Route Modules (`server/routes/`)
- **`auth.js`**:
  - `POST /api/auth/register`: Standard faculty sign-up with bcrypt password hashing.
  - `POST /api/auth/login`: Verifies email and bcrypt password hash, issuing 7-day JWT.
  - `POST /api/auth/demo`: 1-Click Viva Demo login granting instant faculty access for examiners.
  - `POST /api/auth/check-email`: Pre-checks if faculty email is already registered.
  - `POST /api/auth/register-initiate`: Triggers Supabase admin link generation and dispatches 6-digit OTP via email.
  - `POST /api/auth/register-verified`: Completes registration and creates teacher record once OTP is verified.
  - `POST /api/auth/google`: Authenticates faculty via Google OAuth email (guarded: requires prior registration).
  - `GET /api/auth/me`: Returns the authenticated teacher's profile details.
- **`assignments.js`**:
  - `POST /api/assignments`: Creates assignment record, formats question list, derives shareable URL, and generates base64 QR code image.
  - `GET /api/assignments`: Returns all assignments belonging to the logged-in teacher, auto-purges trash older than 3 days, and attaches real-time submission counts.
  - `GET /api/assignments/:id`: Returns full assignment details, student submissions, and regenerated live QR code.
  - `DELETE /api/assignments/:id`: Soft-deletes assignment (`is_deleted: true`), pausing student submissions.
  - `PATCH /api/assignments/:id/restore`: Restores soft-deleted assignment if within the 3-day recovery window.
- **`submissions.js`**:
  - `GET /api/submissions/assignment/:assignmentId`: Public endpoint returning assignment details and questions for the student portal.
  - `POST /api/submissions/:assignmentId`: Public endpoint handling student uploads. Receives `multipart/form-data` with Multer memory storage, validates deadline and file type/size, uploads document to Supabase Storage (`submissions` bucket), checks overwrite rule by student email (deleting prior storage file), runs text extraction, invokes Azure OpenAI grading and Sapling AI detection, and saves or updates the submission record.
  - `PATCH /api/submissions/:id/grade`: Protected teacher endpoint to approve or override the final grade.

### Backend Services (`server/services/`)
- **`aiService.js`**:
  - `extractTextFromFile`: Extracts text using `pdf-parse` for PDFs and `mammoth` for DOCX. Contains `extractPdfStreamsFallback` using `zlib` stream inflation and literal string parsing for malformed PDFs.
  - `cleanExtractedText`: Normalizes whitespace, strips metadata headers, and truncates text to ~4000 characters to optimize token usage.
  - `gradeWithAzureOpenAI`: Formulates system and user prompts, calls Azure OpenAI Chat Completions API (`gpt-5-mini`), requests strict JSON output, validates estimated marks, enforces boundary constraints `[0, maxMarks]`, and implements retry logic.
  - `detectAIContent`: Queries Sapling AI Content Detector API (`/v1/aidetect`) with round-robin key rotation across up to 10 keys, calculating percentage likelihood without blocking submission upon failure.
- **`emailService.js`**:
  - `sendOtpEmail`: Composes responsive HTML email with the 6-digit OTP. Sends via Resend SDK if `RESEND_API_KEY` is present (with test-mode redirect handling), falls back to Brevo SMTP API if `BREVO_API_KEY` is configured, and logs to terminal console in local development.
