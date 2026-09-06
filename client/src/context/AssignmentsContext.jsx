import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAssignments, getAssignment } from '../api';

const AssignmentsContext = createContext(null);

export function AssignmentsProvider({ children }) {
  const [assignments, setAssignments] = useState([]);
  const [assignmentDetails, setAssignmentDetails] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch or refresh the assignment list
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

  // Fetch or refresh a single assignment detail (cached in memory)
  const getCachedAssignment = useCallback(async (id, forceRefresh = false) => {
    // If already cached and not forced, return cached data immediately
    if (!forceRefresh && assignmentDetails[id]) {
      // Re-fetch silently in background
      getAssignment(id)
        .then((res) => {
          setAssignmentDetails((prev) => ({ ...prev, [id]: res.data }));
        })
        .catch(() => {});
      return assignmentDetails[id];
    }

    const res = await getAssignment(id);
    setAssignmentDetails((prev) => ({ ...prev, [id]: res.data }));
    return res.data;
  }, [assignmentDetails]);

  // Update cached assignment detail directly (e.g. after grading)
  const updateCachedAssignment = useCallback((id, updater) => {
    setAssignmentDetails((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: typeof updater === 'function' ? updater(current) : updater,
      };
    });
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
        assignmentDetails,
        getCachedAssignment,
        updateCachedAssignment,
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
