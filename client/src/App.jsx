import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AssignmentsProvider } from './context/AssignmentsContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetail from './pages/AssignmentDetail';
import StudentSubmit from './pages/StudentSubmit';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Auth Routes ── */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <Login />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicAuthRoute>
            <Register />
          </PublicAuthRoute>
        }
      />

      {/* ── Public Student Submission Portal (No login needed) ── */}
      <Route path="/submit/:assignmentId" element={<StudentSubmit />} />

      {/* ── Protected Teacher Routes (Persistent Layout / Navbar) ── */}
      <Route
        element={
          <PrivateRoute>
            <AssignmentsProvider>
              <Layout />
            </AssignmentsProvider>
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateAssignment />} />
        <Route path="/assignment/:id" element={<AssignmentDetail />} />
      </Route>

      {/* ── Default / Fallback ── */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
