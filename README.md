# 🎓 SubmitBridge — AI-Powered Assignment Submission Portal

SubmitBridge is an AI-assisted assignment submission portal built for college faculty and students. It replaces tedious handwritten submissions with an intuitive digital workflow (permanent shareable links + QR codes), while maintaining academic trust via **Azure OpenAI (gpt-5-mini)** grading assistance and **Sapling AI** content likelihood detection.

---

## 🏗️ System Architecture

- **Frontend**: React.js (Vite, Functional Components, Hooks, Plain CSS / Responsive Design)
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage (`submissions` bucket)
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs password hashing
- **Phase 2 (AI Grading)**: Azure OpenAI Service (`gpt-5-mini` model deployment)
- **Phase 3 (AI Detection)**: Sapling AI Content Detector API (with round-robin multi-key rotation)

---

## 📁 Project Structure

```text
SubmitBridge/
├── client/                     # Frontend React application
│   ├── index.html              # HTML entry
│   ├── vite.config.js          # Vite config & API proxy
│   ├── src/
│   │   ├── index.jsx           # React DOM root
│   │   ├── App.jsx             # React Router & PrivateRoute
│   │   ├── api.js              # Central Axios API helper
│   │   └── pages/
│   │       ├── Login.jsx       # Faculty login
│   │       ├── Register.jsx    # Faculty registration
│   │       ├── Dashboard.jsx   # Assignment cards & submission counts
│   │       ├── CreateAssignment.jsx  # PRD expanded field form & QR generator
│   │       ├── AssignmentDetail.jsx  # Submissions table & AI mark review
│   │       └── StudentSubmit.jsx     # Public student upload portal (drag & drop)
│   └── package.json
│
├── server/                     # Backend Node/Express API
│   ├── server.js               # Express application entry
│   ├── supabase.js             # Supabase client singleton
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js             # Teacher authentication routes
│   │   ├── assignments.js      # Assignment CRUD & QR generation
│   │   └── submissions.js      # Public submission, Supabase storage upload & AI pipeline
│   ├── services/
│   │   └── aiService.js        # PDF/DOCX text extraction, Azure OpenAI & Sapling API
│   ├── .env                    # Secrets & API credentials
│   ├── .env.example            # Environment variables template
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd server
npm install
npm start
# Server starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:3000
```

---

## 🎯 Key Features & PRD Compliance

1. **Faculty Assignment Creation**:
   - Includes College Name, Department, Subject, Subject Code, Title, Instructions, Questions, Max Marks, Due Date, Late Submission toggle, and Allowed File Formats (PDF/DOCX).
   - Generates permanent public submission link and QR code image for students.

2. **Student Submission Portal (No Login Required)**:
   - Students open the link or scan QR code on their phone/laptop.
   - Drag & drop or file picker upload with size checks (max 10MB).
   - **Resubmission & Overwrite Rule**: Submitting again with the same Roll Number for the same assignment replaces the old file in Supabase Storage and updates the existing database record.

3. **Phase 2: AI-Assisted Grading**:
   - Extracts text from PDF (`pdf-parse`) and DOCX (`mammoth`).
   - Evaluates content in isolation using Azure OpenAI `gpt-5-mini`.
   - Produces estimated marks, short summary, and marking reasoning.
   - Teacher maintains final authority and can accept or override marks directly on the dashboard.

4. **Phase 3: AI-Generated Content Detection**:
   - Scans text using Sapling AI Detector API.
   - Rotates multiple free-tier keys via round-robin.
   - Graceful fallback: Detection failure never rejects student submissions.
