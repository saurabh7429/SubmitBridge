# SubmitBridge

An AI-powered assignment submission portal — MERN Stack College Minor Project.

## Phase 1: Core Submission Flow

### Features
- 🔐 Teacher login/register with JWT authentication
- 📋 Teacher dashboard with all assignments + submission counts
- ➕ Create assignment with shareable link + QR code
- 📊 Assignment detail view with all student submissions table
- 📤 Student submission page (via link or QR scan) with PDF upload

---

## Folder Structure

```
submitbridge/
├── server/           — Express + Node.js backend
│   ├── models/       — MongoDB schemas (Teacher, Assignment, Submission)
│   ├── routes/       — API route handlers (auth, assignments, submissions)
│   ├── middleware/   — JWT auth middleware
│   ├── uploads/      — PDF files uploaded by students
│   ├── server.js     — Main server file
│   ├── .env          — Secrets (DO NOT commit)
│   └── .env.example  — Template for .env
└── client/           — React frontend
    ├── src/
    │   ├── pages/    — One file per page (Login, Dashboard, etc.)
    │   ├── api.js    — All Axios API calls in one file
    │   ├── App.jsx   — Routes defined here
    │   └── index.js  — React entry point
    ├── index.html    — HTML template for Vite
    └── vite.config.js — Vite dev server config
```

---

## Getting Started

### 1. Clone and install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Start the backend

```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### 4. Start the frontend

```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```

### 5. Create a teacher account

Visit `http://localhost:3000/register` to create your first teacher account.

---

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | No | Register a teacher |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/assignments` | Yes | Get teacher's assignments |
| POST | `/api/assignments` | Yes | Create assignment |
| GET | `/api/assignments/:id` | Yes | Get assignment detail + submissions |
| GET | `/api/submissions/assignment/:id` | No | Get assignment (student view) |
| POST | `/api/submissions/:assignmentId` | No | Submit PDF |

---

## Tech Stack

- **Frontend**: React 19, React Router DOM 7, Axios, Vite
- **Backend**: Node.js, Express 5, Mongoose 9
- **Database**: MongoDB
- **Auth**: JWT (jsonwebtoken), bcryptjs
- **File Upload**: Multer
- **QR Code**: qrcode
