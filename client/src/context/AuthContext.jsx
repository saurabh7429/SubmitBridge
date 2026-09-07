import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTeacherProfile } from '../api';

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
  const [loading, setLoading] = useState(true);

  // Validate token with backend on initial load/mount
  useEffect(() => {
    const hydrateSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await getTeacherProfile();
        if (res.data?.teacher) {
          setTeacher(res.data.teacher);
          localStorage.setItem('teacher', JSON.stringify(res.data.teacher));
        }
      } catch (err) {
        // If 401 or token is invalid, clear zombie session
        console.warn('Session expired or token invalid. Clearing auth state.');
        localStorage.removeItem('token');
        localStorage.removeItem('teacher');
        setToken(null);
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateSession();
  }, []);

  const login = (newToken, teacherData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('teacher', JSON.stringify(teacherData));
    setToken(newToken);
    setTeacher(teacherData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('teacher');
    setToken(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        teacher,
        login,
        logout,
        loading,
        isAuthenticated: Boolean(token),
      }}
    >
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
