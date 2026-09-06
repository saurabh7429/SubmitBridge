import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deleteAssignment, restoreAssignment } from '../api';
import { useAssignments } from '../context/AssignmentsContext';
import { useAuth } from '../context/AuthContext';

import DashboardHero from '../components/dashboard/DashboardHero';
import StatsGrid from '../components/dashboard/StatsGrid';
import SegmentedTabs from '../components/dashboard/SegmentedTabs';
import AssignmentCard from '../components/dashboard/AssignmentCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

function Dashboard() {
  const navigate = useNavigate();
  const { teacher } = useAuth();
  const {
    assignments,
    hasLoaded,
    loading,
    error,
    refreshAssignments,
    setAssignments,
  } = useAssignments();

  const [activeTab, setActiveTab] = useState('active');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    refreshAssignments(hasLoaded).catch((err) => {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    });
  }, [hasLoaded, navigate, refreshAssignments]);

  const handleDelete = async (id, title) => {
    const ok = window.confirm(
      `Move "${title}" to Trash?\n\nSubmissions will be paused, but you can restore it within 3 days.`
    );
    if (!ok) return;

    setActionLoadingId(id);
    try {
      await deleteAssignment(id);
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_deleted: true, deleted_at: new Date().toISOString() } : a
        )
      );
      await refreshAssignments(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (id) => {
    setActionLoadingId(id);
    try {
      await restoreAssignment(id);
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_deleted: false, deleted_at: null } : a
        )
      );
      await refreshAssignments(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore assignment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeAssignments = assignments.filter((a) => !a.is_deleted);
  const trashAssignments = assignments.filter((a) => a.is_deleted);
  const totalSubmissions = assignments.reduce(
    (acc, a) => acc + (Number(a.submissionCount) || 0),
    0
  );

  const displayed = activeTab === 'active' ? activeAssignments : trashAssignments;

  return (
    <div className="page-container">
      {/* ── Welcome Banner with Metrics ── */}
      <DashboardHero teacherName={teacher?.name} />

      {/* ── Quick Stat Widgets ── */}
      <StatsGrid
        activeCount={activeAssignments.length}
        totalSubmissions={totalSubmissions}
        trashCount={trashAssignments.length}
      />

      {/* ── Section Control Toolbar & Tabs ── */}
      <SegmentedTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeAssignments.length}
        trashCount={trashAssignments.length}
      />

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Content View ── */}
      {!hasLoaded && loading ? (
        <CardSkeleton count={3} />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={activeTab === 'active' ? '📝' : '🗑️'}
          title={activeTab === 'active' ? 'No active assignments yet' : 'Trash is completely empty'}
          description={
            activeTab === 'active'
              ? 'Create an assignment to instantly get a QR code and shareable link for students.'
              : 'Assignments moved to trash can be restored within 3 days before permanent deletion.'
          }
          action={
            activeTab === 'active' ? (
              <Link to="/create" className="btn btn-primary">
                + Create Your First Assignment
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="assignment-grid">
          {displayed.map((asgn) => (
            <AssignmentCard
              key={asgn.id}
              assignment={asgn}
              onDelete={handleDelete}
              onRestore={handleRestore}
              isActionLoading={actionLoadingId === asgn.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
