import axios from "axios";

// Base relative API path — Vite proxy forwards /api to http://localhost:5000 in dev
const API_BASE = "/api";

// Helper: retrieve JWT token from localStorage
const getToken = () => localStorage.getItem("token");

// Helper: get authorization header config for protected teacher routes
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// ─── AUTH APIS ────────────────────────────────────────────────────────────────
export const registerTeacher = (name, email, password, collegeName) =>
  axios.post(`${API_BASE}/auth/register`, {
    name,
    email,
    password,
    collegeName,
  });

export const loginTeacher = (email, password) =>
  axios.post(`${API_BASE}/auth/login`, { email, password });

export const getTeacherProfile = () =>
  axios.get(`${API_BASE}/auth/me`, authHeader());

// ─── ASSIGNMENTS APIS ─────────────────────────────────────────────────────────
export const getAssignments = () =>
  axios.get(`${API_BASE}/assignments`, authHeader());

export const getAssignment = (id) =>
  axios.get(`${API_BASE}/assignments/${id}`, authHeader());

export const createAssignment = (assignmentData) =>
  axios.post(`${API_BASE}/assignments`, assignmentData, authHeader());

export const deleteAssignment = (id) =>
  axios.delete(`${API_BASE}/assignments/${id}`, authHeader());

export const restoreAssignment = (id) =>
  axios.patch(`${API_BASE}/assignments/${id}/restore`, {}, authHeader());

// ─── SUBMISSIONS APIS ─────────────────────────────────────────────────────────
export const getAssignmentForStudent = (assignmentId) =>
  axios.get(`${API_BASE}/submissions/assignment/${assignmentId}`);

export const submitAssignment = (assignmentId, formData) =>
  axios.post(`${API_BASE}/submissions/${assignmentId}`, formData);

export const gradeSubmission = (submissionId, teacherFinalMarks) =>
  axios.patch(
    `${API_BASE}/submissions/${submissionId}/grade`,
    { teacherFinalMarks },
    authHeader(),
  );
