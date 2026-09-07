# 21. Code Architecture & Component Analysis — SubmitBridge

This document provides a high-level architectural and programmatic analysis of the core files, components, state management patterns, and service routines in **SubmitBridge**.

---

## 1. Architectural Patterns

### Frontend: Component-Driven Reactive SPA
- **Framework:** React 18 with Vite bundling.
- **Component Pattern:** Functional components paired with standard hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useContext`, `useParams`, `useNavigate`).
- **Layout Shell:** `Layout.jsx` encapsulates the persistent top navigation (`Navbar.jsx`) and renders active route views via React Router's `<Outlet />`.
- **State Segregation:** Global concerns (faculty identity, session validity, and assignment list caching) are elevated to Context providers (`AuthContext` and `AssignmentsContext`), keeping page components focused purely on presentation and local UI interactions.

### Backend: Layered MVC / Service-Oriented Architecture
- **Web Layer (`server/server.js`):** Initializes the Express application, establishes cross-origin policies (`cors`), parses incoming payloads, and delegates routing to dedicated controllers.
- **Middleware Layer (`server/middleware/auth.js`):** Intercepts requests destined for protected endpoints, decoding and verifying JWT Bearer tokens before route execution.
- **Routing Layer (`server/routes/`):** Express routers (`auth.js`, `assignments.js`, `submissions.js`) validating HTTP parameters, enforcing business rules, and coordinating data transactions.
- **Service Layer (`server/services/`):** Dedicated singletons (`aiService.js`, `emailService.js`) that encapsulate external third-party API communication (Azure OpenAI, Sapling AI, Resend, Brevo) away from route handlers.
- **Persistence Layer (`server/supabase.js`):** Database client singleton managing PostgREST queries and Supabase Storage bucket commands.

---

## 2. Deep Dive: Key Backend Services & Functions

### A. Dual-Engine Text Extraction (`server/services/aiService.js`)
```javascript
async function extractTextFromFile(buffer, mimetype, filename = "") { ... }
```
- **Responsibility:** Ingests the binary file buffer directly from Multer memory.
- **Routing:** Directs DOCX files to `mammoth.extractRawText({ buffer })`. Directs PDF files to `pdfParse(buffer)`.
- **Fault-Tolerant Fallback:** If `pdf-parse` fails on non-standard PDF formats (e.g. ReportLab streams), it delegates execution to `extractPdfStreamsFallback(buffer)`.

### B. In-Memory PDF Stream Decompressor (`extractPdfStreamsFallback`)
- **Responsibility:** Scans binary streams matching `/stream\r?\n([\s\S]*?)endstream/g`.
- **Decompression:** Uses Node's native `zlib.inflateSync` to decompress FlateDecode streams (or ASCII85 + FlateDecode).
- **Text Operator Parsing:** Employs regular expressions to isolate Tj (`\((.*?)\)\s*Tj`) and TJ array strings (`\[(.*?)\]\s*TJ`), extracting printable ASCII text literals even when the PDF structure is broken.

### C. Text Normalization & Token Reduction (`cleanExtractedText`)
```javascript
function cleanExtractedText(rawText) { ... }
```
- **Responsibility:** Strips repeated metadata headers (e.g., student name, roll number, dates) to avoid confusing the LLM evaluator.
- **Truncation:** Caps text at **4,000 characters** to ensure fast LLM completion latency and guard against excessive API token consumption.

### D. Azure OpenAI Grading Assistant (`gradeWithAzureOpenAI`)
- **Responsibility:** Calls Azure OpenAI Chat Completions endpoint (`gpt-5-mini`) via standard `fetch`.
- **Structured Schema:** Uses `response_format: { type: "json_object" }` requesting `estimatedMarks`, `summary`, and `reasoning`.
- **Boundary Containment:**
  ```javascript
  marks = Math.max(0, Math.min(Number(maxMarks), Math.round(marks)));
  ```
  Enforces a strict mathematical clamp ensuring that AI marks never fall below 0 or exceed the assignment's maximum marks.
- **Retry Logic:** Implements a 2-attempt retry loop on non-numeric or out-of-bounds responses before gracefully returning a failure status.

### E. Sapling AI Content Detection (`detectAIContent`)
- **Responsibility:** Queries Sapling AI Detector API (`/v1/aidetect`).
- **Round-Robin Pointer:** Stateful pointer `saplingKeyIndex` rotates across all configured keys (`key1 -> key2 -> key3 -> key1`).
- **Key Failover:** If an active key encounters an HTTP 429 quota error, it automatically tests the next key within the same request lifecycle.
- **Non-Blocking Fallback:** If all keys fail, returns `{ score: null, status: "FAILED" }` without interrupting the student's submission.

### F. Transactional Email Service (`server/services/emailService.js`)
- **Responsibility:** Dispatches responsive HTML verification emails containing 6-digit OTP codes.
- **Provider Cascade:** Prioritizes the **Resend SDK** (`resend.emails.send`), includes sandbox test-mode email redirection, falls back to **Brevo SMTP API**, and logs to terminal console in development.

---

## 3. Deep Dive: Key Frontend Components & State Flow

### A. `AuthContext.jsx` (Global Session Management)
- **State:** `token`, `teacher`, `loading`, and computed `isAuthenticated`.
- **Session Hydration:** On initial mount, reads `localStorage.getItem('token')` and dispatches `getTeacherProfile()` (`GET /api/auth/me`). If the backend returns HTTP 401, it automatically clears stale `localStorage` entries and resets session state.
- **Methods:** Exposes `login(newToken, teacherData)` and `logout()`.

### B. `AssignmentsContext.jsx` (Client-Side Caching)
- **Responsibility:** Eliminates redundant network calls when faculty navigate back and forth between the dashboard and detail views.
- **Methods:**
  - `refreshAssignments(force)`: Fetches full assignment list from `/api/assignments` if not already loaded or if forced.
  - `getCachedAssignment(id, force)`: Retrieves assignment details and submissions list from cache or fetches from `/api/assignments/:id`.
  - `updateCachedAssignment(id, updater)`: Immutably mutates cached submission rows upon grade approval.

### C. `SubmissionsTable.jsx` & `SubmissionRow.jsx` (Grading Hub)
- **Search & Filter:** Uses `useMemo` to filter student submissions by search string (name, roll number, email) and status (`ALL`, `GRADED`, `PENDING`).
- **Visual Badges:** Renders colored integrity badges based on Sapling AI score:
  - `< 20%`: Emerald Green (`✓ X% AI`)
  - `20% - 50%`: Amber Yellow (`⚡ X% AI`)
  - `> 50%`: Crimson Red (`⚠️ X% AI`)
- **Inline Grading:** Each row maintains an active points input bound to `handleSaveGrade(subId)`, providing instant feedback and transitioning row status to `Verified`.
- **CSV Generator:** Synthesizes table rows into a formatted `text/csv` URI and triggers an automated browser download.

### D. `FileDropZone.jsx` (Student Upload Target)
- **Interaction:** Supports drag-over, drag-leave, and drop events, as well as hidden `<input type="file" />` clicks.
- **Pre-Upload Validation:** Instantly validates file extensions (`.pdf`, `.docx`) and file size against the 10MB ceiling before allowing form submission.

---

## 4. Error Handling & Robustness Design

1. **Central Express Error Middleware (`server/server.js`):**
   ```javascript
   app.use((err, req, res, next) => {
     console.error("Unhandled server error:", err);
     res.status(err.status || 500).json({
       message: err.message || "Internal server error.",
     });
   });
   ```
   Prevents unhandled promise rejections from crashing the Node.js process and avoids leaking stack traces in production responses.
2. **Graceful Degraded States:** If external services (Azure OpenAI or Sapling AI) fail, the submission record is still saved with `ai_summary` and `ai_detection_status` reflecting the failure, allowing faculty to grade manually.
3. **Empty & Loading States:** Every page implements skeleton loaders (`CardSkeleton`, `DetailSkeleton`) and empty state placeholders (`EmptyState.jsx`) to maintain visual continuity.
