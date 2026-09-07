# Academic Screenshots Inventory — SubmitBridge

This directory contains real, high-resolution screenshots captured directly from the live deployed production environment of **SubmitBridge** (`https://submit-bridge.vercel.app/`).

---

## 1. Inventory of Captured Screenshots

| Screenshot Filename | Route / View | Description of Captured Screen |
| :--- | :--- | :--- |
| **`01_Register.png`** | `/register` | **Faculty Registration Screen:** Name, College, Email, Password, and Confirm Password form fields. |
| **`02_Login.png`** | `/login` | **Faculty Sign In Screen:** "Continue with Google" OAuth button, email/password inputs, and password visibility toggle. |
| **`03_Teacher_Dashboard.png`** | `/dashboard` | **Teacher Dashboard:** Faculty greeting ("Good night, Prof. saurabh"), Active vs. Trash stats grid, segmented tab toolbar, and grid of active assignment cards. |
| **`04_Create_Assignment.png`** | `/create` | **Coursework Creation Wizard:** Two-column institutional details, dynamic numbered questions builder, point scale, deadline picker, and file type selector. |
| **`05_Assignment_Details.png`** | `/assignment/:id` | **Assignment Overview & Submissions Log:** Header metadata card, live student QR code canvas card, search/filter toolbar, CSV export button, and full student submissions table with AI score badges. |
| **`06_AI_Evaluation_Modal.png`** | Modal Dialog | **AI Assessment Report Modal:** Estimated AI score (`3 / 5`), submission summary, and detailed AI marking justification & rationale. |
| **`07_Student_Submit_Portal.png`** | `/submit/:id` | **Student Submission Portal (Signed-In View):** Institutional banner, assignment guidelines, numbered questions, verified Google account badge, and PDF/DOCX drag-and-drop file upload zone. |
| **`07a_Student_Identity_Wall.png`** | `/submit/:id` | **Student Identity Verification Wall (Signed-Out View):** Lock icon, instructions, and "Sign in with Google" button requiring student email verification prior to coursework upload. |

---

## 2. Guide for Additional Manual Screenshots (Optional for Project Report)

If your academic guide or college department requires specific student roll numbers, custom subject titles, or custom college branding in your project report, you can capture additional screenshots using the following recommended steps:

1. **Successful Student Submission Receipt Screen (`08_Submission_Receipt.png`):**
   - Navigate to `/submit/<assignment-id>`.
   - Complete Google sign-in.
   - Enter your Roll Number and upload a sample assignment document.
   - Click "Submit Assignment Now →" and capture the green confirmation checkmark view (`SubmissionSuccess.jsx`).

2. **CSV Spreadsheet Export (`09_CSV_Export_Spreadsheet.png`):**
   - Navigate to `/assignment/<assignment-id>` on the faculty portal.
   - Click "Export CSV".
   - Open the downloaded `.csv` file in Microsoft Excel or Google Sheets and capture the table view showing roll numbers, AI scores, and approved grades.

3. **Trash & 3-Day Recovery View (`10_Trash_Retention.png`):**
   - On the Teacher Dashboard, click the "Trash" tab.
   - Capture the archived assignments view highlighting the 3-day recovery notice and "Restore" action button.
