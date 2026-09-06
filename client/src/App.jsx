import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetail from './pages/AssignmentDetail';
import StudentSubmit from './pages/StudentSubmit';

// Protected Route wrapper for teacher pages
// If no token exists in localStorage, redirects to /login
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Student Submission Portal (accessible via QR code or shared link) */}
        <Route path="/submit/:assignmentId" element={<StudentSubmit />} />

        {/* Protected Teacher / Faculty Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateAssignment />
            </PrivateRoute>
          }
        />
        <Route
          path="/assignment/:id"
          element={
            <PrivateRoute>
              <AssignmentDetail />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="*"
          element={
            localStorage.getItem('token') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

