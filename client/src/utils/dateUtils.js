/**
 * Utility functions for date formatting and deadline calculations
 */

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysRemaining(deletedAt) {
  if (!deletedAt) return '3d remaining';
  const diffMs = 3 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(deletedAt).getTime());
  const hoursLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const daysLeft = Math.floor(hoursLeft / 24);
  return daysLeft >= 1
    ? `${daysLeft}d ${hoursLeft % 24}h left`
    : `${hoursLeft}h left`;
}

export function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date() > new Date(dueDate);
}
