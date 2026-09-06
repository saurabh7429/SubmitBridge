import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { deleteAssignment, restoreAssignment } from "../api";
import { useAssignments } from "../context/AssignmentsContext";
import { useAuth } from "../context/AuthContext";

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

  const [activeTab, setActiveTab] = useState("active"); // "active" | "trash"
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    // If we already loaded data before, fetch silently in background.
    // If first load, show skeleton.
    refreshAssignments(hasLoaded).catch((err) => {
      if (err.response?.status === 401) {
        navigate("/login");
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
      // Optimistic update
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_deleted: true, deleted_at: new Date().toISOString() } : a
        )
      );
      await refreshAssignments(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete assignment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (id) => {
    setActionLoadingId(id);
    try {
      await restoreAssignment(id);
      // Optimistic update
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_deleted: false, deleted_at: null } : a
        )
      );
      await refreshAssignments(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore assignment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return "3d remaining";
    const diffMs =
      3 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(deletedAt).getTime());
    const hoursLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const daysLeft = Math.floor(hoursLeft / 24);
    return daysLeft >= 1
      ? `${daysLeft}d ${hoursLeft % 24}h left`
      : `${hoursLeft}h left`;
  };

  const activeAssignments = assignments.filter((a) => !a.is_deleted);
  const trashAssignments = assignments.filter((a) => a.is_deleted);
  const totalSubmissions = assignments.reduce(
    (acc, a) => acc + (Number(a.submissionCount) || 0),
    0
  );

  const displayed = activeTab === "active" ? activeAssignments : trashAssignments;

  return (
    <div className="page-container page-enter">
      {/* ── Welcome Banner with Metrics ── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero__content">
          <div className="dashboard-hero__badge">
            <span className="pulsing-dot" />
            Faculty Portal Active
          </div>
          <h1 className="dashboard-hero__title">
            Welcome back{teacher?.name ? `, Prof. ${teacher.name}` : ""}
          </h1>
          <p className="dashboard-hero__subtitle">
            Create assignments, distribute instant QR codes, and automate grading with AI analysis.
          </p>
        </div>

        <div className="dashboard-hero__action">
          <Link to="/create" className="btn btn-primary btn-glow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Create Assignment</span>
          </Link>
        </div>
      </div>

      {/* ── Quick Stat Widgets ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--indigo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
          </div>
          <div className="stat-card__data">
            <span className="stat-card__value">{activeAssignments.length}</span>
            <span className="stat-card__label">Active Assignments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div className="stat-card__data">
            <span className="stat-card__value">{totalSubmissions}</span>
            <span className="stat-card__label">Student Submissions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
          <div className="stat-card__data">
            <span className="stat-card__value">{trashAssignments.length}</span>
            <span className="stat-card__label">In Trash (3-Day Retention)</span>
          </div>
        </div>
      </div>

      {/* ── Section Control Header & Tabs ── */}
      <div className="section-toolbar">
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-control__item ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Active Assignments</span>
            <span className="segmented-control__count">{activeAssignments.length}</span>
          </button>

          <button
            type="button"
            className={`segmented-control__item ${activeTab === "trash" ? "active" : ""}`}
            onClick={() => setActiveTab("trash")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>Trash</span>
            <span className="segmented-control__count">{trashAssignments.length}</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Content View ── */}
      {!hasLoaded && loading ? (
        <div className="assignment-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-line skeleton-line--pill" />
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--text" />
              <div className="skeleton-line skeleton-line--btn" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card-neumorphic empty-state-card">
          <div className="empty-state">
            <div className="empty-state__icon">
              {activeTab === "active" ? "📝" : "🗑️"}
            </div>
            <h3 className="empty-state__title">
              {activeTab === "active"
                ? "No active assignments yet"
                : "Trash is completely empty"}
            </h3>
            <p className="empty-state__desc">
              {activeTab === "active"
                ? "Create an assignment to instantly get a QR code and shareable link for students."
                : "Assignments moved to trash can be restored within 3 days before permanent deletion."}
            </p>
            {activeTab === "active" && (
              <Link to="/create" className="btn btn-primary">
                + Create Your First Assignment
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="assignment-grid">
          {displayed.map((asgn) => {
            const isDeleted = asgn.is_deleted;
            const isOverdue =
              asgn.due_date && new Date() > new Date(asgn.due_date);

            return (
              <div
                key={asgn.id}
                className={`assignment-card ${isDeleted ? "assignment-card--deleted" : ""}`}
              >
                {/* Top decorative gradient bar */}
                <div className="assignment-card__bar" />

                {/* Card Header */}
                <div className="assignment-card__header">
                  <div className="assignment-card__badges">
                    <span className="badge badge-indigo">
                      {asgn.subject}
                      {asgn.subject_code ? ` • ${asgn.subject_code}` : ""}
                    </span>
                    {asgn.department && (
                      <span className="badge badge-gray">{asgn.department}</span>
                    )}
                  </div>

                  <div className="assignment-card__actions">
                    <span className="badge badge-emerald" title="Total student submissions">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {asgn.submissionCount || 0}
                    </span>

                    {!isDeleted ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(asgn.id, asgn.title)}
                        disabled={actionLoadingId === asgn.id}
                        title="Move to Trash (Recoverable for 3 days)"
                        className="btn-icon-danger"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(asgn.id)}
                        disabled={actionLoadingId === asgn.id}
                        title="Restore assignment"
                        className="btn btn-success btn--sm"
                      >
                        {actionLoadingId === asgn.id ? "…" : "♻️ Restore"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Trash Banner */}
                {isDeleted && (
                  <div className="trash-banner">
                    <span className="trash-banner__warning">⚠️ In Trash — Submissions Closed</span>
                    <span className="trash-banner__time">⏳ {getDaysRemaining(asgn.deleted_at)}</span>
                  </div>
                )}

                {/* Assignment Title */}
                <h3 className="assignment-card__title" title={asgn.title}>
                  {asgn.title}
                </h3>

                {/* Meta details */}
                <div className="assignment-card__meta">
                  <div className="meta-pill">
                    <span className="meta-pill__label">Max Marks</span>
                    <span className="meta-pill__value">{asgn.max_marks} pts</span>
                  </div>

                  <div className="meta-pill">
                    <span className="meta-pill__label">Status</span>
                    {isDeleted ? (
                      <span className="status-pill status-pill--danger">Archived</span>
                    ) : isOverdue ? (
                      <span className="status-pill status-pill--danger">Closed</span>
                    ) : (
                      <span className="status-pill status-pill--success">Open</span>
                    )}
                  </div>

                  {asgn.due_date && (
                    <div className="meta-pill meta-pill--full">
                      <span className="meta-pill__label">Due</span>
                      <span className={`meta-pill__value ${isOverdue ? "text-danger" : ""}`}>
                        {new Date(asgn.due_date).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Button */}
                <div className="assignment-card__footer">
                  {!isDeleted ? (
                    <Link
                      to={`/assignment/${asgn.id}`}
                      className="btn btn-primary-soft btn--full"
                    >
                      <span>View Submissions & QR Code</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </Link>
                  ) : (
                    <div className="card-actions-dual">
                      <button
                        type="button"
                        onClick={() => handleRestore(asgn.id)}
                        disabled={actionLoadingId === asgn.id}
                        className="btn btn-success"
                        style={{ flex: 1 }}
                      >
                        {actionLoadingId === asgn.id ? "Restoring..." : "♻️ Restore"}
                      </button>
                      <Link
                        to={`/assignment/${asgn.id}`}
                        className="btn btn-secondary"
                        style={{ flex: 1, textAlign: "center" }}
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
