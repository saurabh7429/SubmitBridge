import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [teacher, setTeacher] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('teacher') || 'null');
    } catch {
      return null;
    }
  });

  const login = (newToken, teacherData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('teacher', JSON.stringify(teacherData));
    setToken(newToken);
    setTeacher(teacherData);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider value={{ token, teacher, login, logout, isAuthenticated: Boolean(token) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
