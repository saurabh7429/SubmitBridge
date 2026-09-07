# 20. Academic Project Documentation Details & Template — SubmitBridge

This document provides the formal academic project report template, candidate metadata placeholders, executive abstract, and academic keywords for the **BCA Minor Project** submission.

---

## 1. Candidate & Institutional Metadata Template

*(Please fill in your personal, guide, and college details in the placeholders below before final printing/binding)*

- **Project Title:** SubmitBridge — AI-Assisted Academic Assignment Submission & Evaluation Portal
- **Candidate / Student Name:** [STUDENT NAME HERE]
- **Enrollment / Roll Number:** [ROLL / ENROLLMENT NUMBER HERE]
- **Academic Course:** Bachelor of Computer Applications (BCA)
- **Current Semester:** [SEMESTER NUMBER HERE, e.g. V or VI Semester]
- **Department:** Department of Computer Applications / Information Technology
- **College / Institute Name:** [COLLEGE NAME HERE]
- **Affiliated University:** [UNIVERSITY NAME HERE]
- **Academic Year:** 2025 – 2026
- **Project Guide / Supervisor:** [GUIDE / PROFESSOR NAME HERE]
- **Designation of Project Guide:** [e.g. Assistant Professor / Head of Department]

---

## 2. Project Title

```text
SubmitBridge: A Modern Cloud-Native Portal for Digital Assignment Submission, 
Preliminary AI Evaluation, and Academic Coursework Management
```

---

## 3. Executive Abstract

The traditional paradigm of academic coursework submission in higher education institutions suffers from physical clutter, paper wastage, manual record-keeping errors, and protracted evaluation cycles. Concurrently, informal digital submission channels such as personal emails and messaging groups create unorganized inboxes, inconsistent naming, and academic integrity blindspots.

This project presents **SubmitBridge**, a cloud-native, web-based digital assignment management and assistive evaluation platform designed specifically for college faculty and students. Built upon a React (Vite) frontend, a Node.js/Express RESTful backend, and Supabase (PostgreSQL 17.6 and Object Storage), the platform bridges coursework logistics through an intuitive two-tier workflow.

Faculty members authenticate via institutional email verification (6-digit OTP via Resend) or Google OAuth, access a dedicated dashboard, and create structured assignments featuring dynamic question lists, strict deadlines, and file constraints. The platform automatically generates permanent shareable URLs and high-contrast base64 QR codes suitable for classroom projection and mobile access. Students access the submission gateway frictionlessly without prior account creation, verify their identity via Google OAuth, and submit PDF or Word documents (up to 10MB) via drag-and-drop. 

Upon submission, the server ingests documents entirely in memory using Multer, extracts textual content through dual-engine parsing (`pdf-parse` with stream decompression fallback and `mammoth`), and initiates a multi-stage AI pipeline. The system utilizes **Azure OpenAI (`gpt-5-mini`)** to evaluate coursework in isolation, producing estimated marks bounded within maximum limits, an evaluation summary, and marking justification. Simultaneously, the platform assesses machine-generation likelihood via the **Sapling AI Content Detector API**, employing a stateful round-robin rotation across multiple API keys. 

Crucially, the platform enforces human-in-the-loop governance: AI scores serve solely as assistive signals, leaving faculty with full autonomy to review justifications, inspect original documents, override marks, approve final grades, and export comprehensive grade sheets to formatted CSV spreadsheets.

---

## 4. Academic Keywords

- Educational Technology (EdTech)
- Cloud-Native Assignment Submission
- Artificial Intelligence in Education
- Large Language Models (LLM)
- Automated Grading Assistance
- AI-Generated Content Detection
- QR Code Logistics
- React Single Page Application (SPA)
- Node.js / Express Architecture
- Supabase PostgreSQL & Cloud Object Storage
- Teacher-in-the-Loop Governance
