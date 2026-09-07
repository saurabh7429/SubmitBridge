# SubmitBridge Academic Documentation Data Package

**Project Name:** SubmitBridge  
**Academic Degree:** Bachelor of Computer Applications (BCA) — Minor Project  
**Repository Source of Truth:** `c:\Users\msaur\Desktop\github\SubmitBridge\`  
**Prepared Date:** September 2026  

---

## 1. Executive Overview

This folder (**`SubmitBridge_Documentation_Data`**) contains the complete, verified academic documentation package for the BCA Minor Project **"SubmitBridge"**.

Every document, diagram, test case, schema definition, and API specification in this package was authored by thoroughly inspecting the **actual current source code**, database structure on Supabase, and live deployed applications on Vercel and Render. 

> [!IMPORTANT]
> **Strict Source of Truth Policy:**
> Where the historical repository `README.md` conflicted with the working codebase (such as student login requirements or resubmission keys), the working implementation was prioritized. Full details are recorded in [`24_Source_of_Truth.md`](./24_Source_of_Truth.md).

> [!NOTE]
> **Security & Privacy Guarantee:**
> All private credentials, database connection strings, Supabase service-role keys, JWT secrets, Azure OpenAI API keys, Sapling keys, and Resend keys have been strictly replaced with `[REDACTED]`. No sensitive secrets are stored anywhere in this documentation package.

---

## 2. Directory & Documentation Index

| File / Folder Name | Content & Purpose |
| :--- | :--- |
| [`01_Project_Overview.md`](./01_Project_Overview.md) | Problem statement, proposed solution, objectives, target users, modules, business rules, implemented vs. unimplemented features, and limitations. |
| [`02_Technology_Stack.md`](./02_Technology_Stack.md) | Comprehensive audit of all frontend, backend, database, AI, and cloud services, including exact versions from `package.json`. |
| [`03_Project_Structure.md`](./03_Project_Structure.md) | Complete directory tree explaining the responsibility of every component, route, context provider, and service. |
| [`04_Database_Documentation.md`](./04_Database_Documentation.md) | PostgreSQL database documentation: tables (`teachers`, `assignments`, `submissions`), columns, types, keys, relationships, constraints, and storage buckets. |
| [`05_Database_Schema/`](./05_Database_Schema/) | Production-ready, sanitized SQL scripts: `01_create_tables.sql`, `02_indexes_and_constraints.sql`, and `03_storage_setup.sql`. |
| [`06_API_Documentation.md`](./06_API_Documentation.md) | Complete REST API specification for all 17 endpoints across auth, assignments, and submissions (methods, bodies, headers, responses, callers). |
| [`07_Authentication.md`](./07_Authentication.md) | Authentication models: Faculty registration with 6-digit email OTP, bcrypt password hashing, 7-day JWT tokens, Google OAuth, and student identity verification. |
| [`08_File_Storage.md`](./08_File_Storage.md) | In-memory Multer buffering, Supabase Storage bucket (`submissions`), 10MB limits, MIME whitelisting, and automated resubmission cleanup rules. |
| [`09_Assignment_Workflow.md`](./09_Assignment_Workflow.md) | Detailed step-by-step academic workflow for both faculty members (creation to CSV grade export) and students (access to receipt). |
| [`10_AI_Features.md`](./10_AI_Features.md) | Dual-engine text extraction, Azure OpenAI (`gpt-5-mini`) grading assistance, mathematical score clamping, Sapling AI detection with round-robin key rotation. |
| [`11_Security.md`](./11_Security.md) | Implemented security practices (cryptography, in-memory buffers, CORS, sanitization, isolation) and recommended future security enhancements. |
| [`12_Deployment.md`](./12_Deployment.md) | Live cloud deployment guide covering Vercel Edge CDN (Frontend), Render Web Service (Backend), and Supabase (Database/Storage). |
| [`13_Environment_Variables.md`](./13_Environment_Variables.md) | Tabular reference of all `.env` variables used by the client and server with safe placeholders and descriptions. |
| [`14_UI_Screens.md`](./14_UI_Screens.md) | Detailed UI specification of all 6 application screens (Login, Register, Dashboard, Create, Detail, Student Submit). |
| [`15_Screenshots/`](./15_Screenshots/) | 8 real, high-resolution PNG screenshots captured from the live deployed platform, plus `SCREENSHOTS_NEEDED.md`. |
| [`16_Diagrams/`](./16_Diagrams/) | 8 Mermaid (`.mmd`) diagram models: architecture, system flow, teacher workflow, student workflow, database ER, AI pipeline, auth flow, file upload flow. |
| [`17_Testing.md`](./17_Testing.md) | Quality assurance test matrix covering 32 verified test cases spanning auth, coursework, student submissions, AI grading, and edge cases. |
| [`18_Requirements.md`](./18_Requirements.md) | Software Requirements Specification (SRS) listing functional, non-functional, hardware, software, and browser requirements. |
| [`19_Limitations_Future_Scope.md`](./19_Limitations_Future_Scope.md) | Architectural boundaries of the current release and a structured roadmap for Phase 2 (OCR, notifications) and Phase 3 (plagiarism matrix, SSO). |
| [`20_Academic_Details_Template.md`](./20_Academic_Details_Template.md)| Fill-in template for student name, roll number, college, guide, university, abstract, and academic keywords. |
| [`21_Code_Analysis.md`](./21_Code_Analysis.md) | In-depth code walkthrough explaining important algorithms, fallback parsers, retry loops, context hydration, and caching. |
| [`22_Project_Config/`](./22_Project_Config/) | Sanitized copies of `package.json`, `vite.config.js`, `vercel.json`, `server.js`, and `.env.example`. |
| [`23_Implementation_Checklist.md`](./23_Implementation_Checklist.md) | Comprehensive feature status checklist detailing implemented vs. unimplemented features with file evidence. |
| [`24_Source_of_Truth.md`](./24_Source_of_Truth.md) | Explanation of codebase inspection and detailed documentation of all 7 discrepancies between the old README and the actual working code. |
| [`25_Project_Inventory.md`](./25_Project_Inventory.md) | Metrics and inventory of all 83 project assets, files, dependencies, and modules. |

---

## 3. Important Instructions for Preparing Final Project Report / PPT

When preparing your final BCA Minor Project report, presentation slides, or viva submission:

1. **Candidate & College Information:**
   - Open [`20_Academic_Details_Template.md`](./20_Academic_Details_Template.md) and replace the bracketed placeholders (`[STUDENT NAME HERE]`, `[ROLL / ENROLLMENT NUMBER HERE]`, `[COLLEGE NAME HERE]`) with your official academic details.
2. **Screenshots for Report & PPT:**
   - Real, high-resolution screenshots are located in [`15_Screenshots/`](./15_Screenshots/).
   - Copy these PNG files directly into your project report document or PowerPoint presentation.
3. **Mermaid Diagrams for Architecture & Flowcharts:**
   - The `.mmd` files in [`16_Diagrams/`](./16_Diagrams/) can be opened in [Mermaid Live Editor](https://mermaid.live/) or rendered in markdown previewers to export crisp vector diagrams (SVG or high-res PNG) for inclusion in your print report.
4. **Demonstrating to University Examiners (Viva):**
   - Use the **1-Click Viva Demo Login** feature (`POST /api/auth/demo`) to showcase the teacher dashboard immediately without having to register a new account during the viva examination.
   - Point examiners to [`23_Implementation_Checklist.md`](./23_Implementation_Checklist.md) and [`10_AI_Features.md`](./10_AI_Features.md) to demonstrate the teacher-in-the-loop ethical AI architecture.
