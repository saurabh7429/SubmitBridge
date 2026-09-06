import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAssignments } from '../api';

const AssignmentsContext = createContext(null);

export function AssignmentsProvider({ children }) {
  const [assignments, setAssignments] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshAssignments = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await getAssignments();
      setAssignments(res.data || []);
      setHasLoaded(true);
      setError('');
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        throw err;
      }
      setError('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AssignmentsContext.Provider
      value={{
        assignments,
        setAssignments,
        hasLoaded,
        loading,
        error,
        refreshAssignments,
      }}
    >
      {children}
    </AssignmentsContext.Provider>
  );
}

export function useAssignments() {
  const context = useContext(AssignmentsContext);
  if (!context) {
    throw new Error('useAssignments must be used within an AssignmentsProvider');
  }
  return context;
}
