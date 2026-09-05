import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetail from './pages/AssignmentDetail';
import StudentSubmit from './pages/StudentSubmit';

// Helper component: PrivateRoute
// Checks if a JWT token exists in localStorage.
// If yes, show the requested page. If no, redirect to /login.
// This protects teacher-only pages from being accessed without logging in.
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

// App.jsx — the root component that defines all the page routes
// BrowserRouter: enables client-side routing (URL changes without page reload)
// Routes: container for all Route definitions
// Route: maps a URL path to a component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect "/" to "/login" by default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes — anyone can access these */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public student submission route — accessed via shareable link or QR code */}
        <Route path="/submit/:assignmentId" element={<StudentSubmit />} />

        {/* Protected teacher routes — wrapped in PrivateRoute */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
