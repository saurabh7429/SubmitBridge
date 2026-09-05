import axios from 'axios';

// Base URL for all API calls
// In development, Vite's proxy (vite.config.js) forwards /api requests to http://localhost:5000
// So we just use /api as a relative path — no CORS issues!
const API_BASE = '/api';

// Helper: get the JWT token stored in browser localStorage
const getToken = () => localStorage.getItem('token');

// Helper: return Axios config with Authorization header (needed for protected routes)
const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Login: send email + password, get back a JWT token
export const login = (email, password) =>
  axios.post(`${API_BASE}/auth/login`, { email, password });

// Register: create a new teacher account
export const register = (name, email, password) =>
  axios.post(`${API_BASE}/auth/register`, { name, email, password });

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────

// Get all assignments for the logged-in teacher (dashboard)
export const getAssignments = () =>
  axios.get(`${API_BASE}/assignments`, authHeader());

// Get a single assignment + its submissions (teacher detail view)
export const getAssignment = (id) =>
  axios.get(`${API_BASE}/assignments/${id}`, authHeader());

// Create a new assignment (returns assignment + QR code)
export const createAssignment = (data) =>
  axios.post(`${API_BASE}/assignments`, data, authHeader());

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────────

// Get assignment details for the student (no auth needed)
export const getAssignmentForStudent = (assignmentId) =>
  axios.get(`${API_BASE}/submissions/assignment/${assignmentId}`);

// Submit a PDF for an assignment
// FormData is used because we're uploading a file (multipart/form-data)
export const submitAssignment = (assignmentId, formData) =>
  axios.post(`${API_BASE}/submissions/${assignmentId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',  // Tell the server this is a file upload
    },
  });
