# 25. Project Inventory & File Catalog — SubmitBridge

This document provides a comprehensive inventory of all source code files, configurations, database scripts, screenshots, and diagrams comprising **SubmitBridge**.

---

## 1. High-Level Inventory Metrics

| Category | File Count | Primary Locations |
| :--- | :---: | :--- |
| **Frontend Source Files** | 25 | `client/src/` (Pages, Components, Contexts, Utils, Styles) |
| **Backend Source Files** | 8 | `server/` (`server.js`, `supabase.js`, `middleware/`, `routes/`, `services/`) |
| **Configuration Files** | 6 | `package.json`, `vite.config.js`, `vercel.json`, `.env.example` |
| **Database Schema Scripts** | 3 | `SubmitBridge_Documentation_Data/05_Database_Schema/` |
| **Mermaid Diagram Models** | 8 | `SubmitBridge_Documentation_Data/16_Diagrams/` |
| **Production Screenshots** | 8 | `SubmitBridge_Documentation_Data/15_Screenshots/` |
| **Academic Documentation Files** | 25 | `SubmitBridge_Documentation_Data/` |
| **Total Tracked Project Assets** | **83** | Entire Repository (excluding `node_modules`, `.git`, `dist`) |

---

## 2. Detailed File Breakdown

### A. Frontend Source Files (`client/src/`)
1. `index.html` — HTML document shell entry.
2. `src/index.jsx` — React DOM mount script.
3. `src/App.jsx` — React Router setup, `PrivateRoute`, and `PublicAuthRoute` definitions.
4. `src/api.js` — Central Axios instance with authorization interceptor.
5. `src/supabaseClient.js` — Browser Supabase client initialization (anon key).
6. `src/styles/global.css` — Central 60KB CSS design tokens, components, and layout utilities.
7. `src/utils/dateUtils.js` — Formatting utilities, relative timestamps, and `isOverdue` checker.
8. `src/context/AuthContext.jsx` — Faculty authentication state provider and session hydration.
9. `src/context/AssignmentsContext.jsx` — Client-side caching and mutation manager for assignments.
10. `src/pages/Login.jsx` — Faculty sign-in page (password, Google, demo login).
11. `src/pages/Register.jsx` — Faculty two-step registration wizard with email OTP verification.
12. `src/pages/Dashboard.jsx` — Faculty overview page with active and trash tabs.
13. `src/pages/CreateAssignment.jsx` — Assignment builder form with dynamic question array.
14. `src/pages/AssignmentDetail.jsx` — Coursework submissions log, QR code canvas, and inline grading table.
15. `src/pages/StudentSubmit.jsx` — Public student submission gateway with Google identity wall.
16. `src/components/layout/Layout.jsx` — Persistent layout wrapper.
17. `src/components/layout/Navbar.jsx` — Top navigation bar with faculty profile and logout.
18. `src/components/dashboard/DashboardHero.jsx` — Welcome greeting banner.
19. `src/components/dashboard/StatsGrid.jsx` — Active and trash summary widgets.
20. `src/components/dashboard/SegmentedTabs.jsx` — Tab switcher control.
21. `src/components/dashboard/AssignmentCard.jsx` — Assignment card with actions.
22. `src/components/assignment/AssignmentHeaderCard.jsx` — Coursework metadata display.
23. `src/components/assignment/AssignmentQrCard.jsx` — QR code canvas card with copy link action.
24. `src/components/assignment/CreateAssignmentSuccess.jsx` — Post-creation modal with QR code.
25. `src/components/assignment/SubmissionsTable.jsx` — Searchable submissions table with CSV export.
26. `src/components/assignment/SubmissionRow.jsx` — Submission row with inline grading and status.
27. `src/components/assignment/AISummaryModal.jsx` — AI evaluation score and justification modal.
28. `src/components/student/StudentHeader.jsx` — Student gateway branding header.
29. `src/components/student/StudentOverview.jsx` — Assignment guidelines and question prompt.
30. `src/components/student/FileDropZone.jsx` — Drag-and-drop document upload target.
31. `src/components/student/SubmissionSuccess.jsx` — Submission receipt confirmation.
32. `src/components/forms/FormField.jsx` — Form field label and error wrapper.
33. `src/components/forms/FileTypeSelector.jsx` — File format toggle checkboxes.
34. `src/components/common/BackButton.jsx` — Navigation back button.
35. `src/components/common/Badge.jsx` — Colored status and integrity badge.
36. `src/components/common/CopyButton.jsx` — Copy-to-clipboard action with feedback checkmark.
37. `src/components/common/EmptyState.jsx` — Zero-data placeholder.
38. `src/components/common/LoadingSkeleton.jsx` — Shimmering loading skeletons.
39. `src/components/common/Modal.jsx` — Reusable dialog wrapper.
40. `src/components/common/StatusPill.jsx` — Assignment lifecycle pill.

---

### B. Backend Source Files (`server/`)
1. `server.js` — Express application entry, CORS, body parsers, routes, error handling.
2. `supabase.js` — Supabase client singleton using service-role key.
3. `middleware/auth.js` — JWT verification middleware.
4. `routes/auth.js` — Faculty auth, email OTP, Google OAuth, demo login.
5. `routes/assignments.js` — Assignment CRUD, QR generation, soft-delete, restore.
6. `routes/submissions.js` — Student submission ingestion, storage upload, overwrite, grading.
7. `services/aiService.js` — In-memory text extraction, Azure OpenAI grading, Sapling AI detection.
8. `services/emailService.js` — Resend and Brevo transactional email delivery for OTPs.

---

### C. Database Scripts (`SubmitBridge_Documentation_Data/05_Database_Schema/`)
1. `01_create_tables.sql` — DDL creating `teachers`, `assignments`, and `submissions`.
2. `02_indexes_and_constraints.sql` — Performance indexes, foreign keys, and unique constraints.
3. `03_storage_setup.sql` — Storage bucket declaration and access policies.

---

### D. Architectural & Workflow Diagrams (`SubmitBridge_Documentation_Data/16_Diagrams/`)
1. `architecture.mmd` — Multi-tier system architecture diagram.
2. `system_flow.mmd` — End-to-end system sequence diagram.
3. `teacher_workflow.mmd` — Faculty creation and evaluation flowchart.
4. `student_workflow.mmd` — Student coursework submission flowchart.
5. `database_er.mmd` — Entity-Relationship model.
6. `ai_pipeline_flow.mmd` — Ingestion, text extraction, Azure OpenAI, and Sapling AI flow.
7. `auth_flow.mmd` — Registration OTP, password login, and Google OAuth sequence.
8. `file_upload_flow.mmd` — Multipart ingestion, storage upload, and overwrite flowchart.

---

### E. Live System Screenshots (`SubmitBridge_Documentation_Data/15_Screenshots/`)
1. `01_Register.png` — Faculty registration screen.
2. `02_Login.png` — Faculty sign-in screen.
3. `03_Teacher_Dashboard.png` — Teacher dashboard with active coursework cards.
4. `04_Create_Assignment.png` — Coursework creation form.
5. `05_Assignment_Details.png` — Submissions table, QR code card, and CSV export.
6. `06_AI_Evaluation_Modal.png` — AI assessment score, summary, and justification modal.
7. `07_Student_Submit_Portal.png` — Student submission portal with questions and file dropzone.
8. `07a_Student_Identity_Wall.png` — Student Google identity verification wall.
9. `SCREENSHOTS_NEEDED.md` — Detailed screenshot inventory and manual capture instructions.

---

## 3. Key Dependencies & Versions

| Package Name | Tier | Version | Role in SubmitBridge |
| :--- | :---: | :---: | :--- |
| `react` / `react-dom` | Frontend | `18.3.1` | Core reactive UI library |
| `vite` | Frontend | `5.4.11` | Build tool and development server |
| `react-router-dom` | Frontend | `6.28.0` | Client-side routing and navigation |
| `axios` | Frontend | `1.7.9` | REST API communication with Bearer token injection |
| `@supabase/supabase-js` | Both | `2.49.1` / `2.115.0` | Client OAuth listeners and backend database operations |
| `express` | Backend | `4.21.2` | RESTful API routing and server middleware |
| `bcryptjs` | Backend | `2.4.3` | One-way password hashing (10 salt rounds) |
| `jsonwebtoken` | Backend | `9.0.2` | JWT generation and authorization middleware |
| `multer` | Backend | `1.4.5-lts.1` | In-memory multipart document buffer ingestion |
| `pdf-parse` | Backend | `1.1.4` | Binary PDF text extraction |
| `mammoth` | Backend | `1.9.0` | Word document (`.docx`) text extraction |
| `qrcode` | Both | `1.5.4` | Base64 Data URL QR code generation |
| `resend` | Backend | `6.26.0` | Transactional verification email delivery |
