import React from 'react';

const statusConfig: Record<string, string> = {
  AVAILABLE: 'badge-green',
  ALLOCATED: 'badge-blue',
  RESERVED: 'badge-purple',
  UNDER_MAINTENANCE: 'badge-yellow',
  LOST: 'badge-red',
  RETIRED: 'badge-gray',
  DISPOSED: 'badge-gray',
  ACTIVE: 'badge-green',
  INACTIVE: 'badge-gray',
  SUSPENDED: 'badge-red',
  PENDING: 'badge-yellow',
  APPROVED: 'badge-green',
  REJECTED: 'badge-red',
  CONFIRMED: 'badge-green',
  COMPLETED: 'badge-green',
  CANCELLED: 'badge-red',
  IN_PROGRESS: 'badge-blue',
  WAITING_PARTS: 'badge-yellow',
  NEW: 'badge-green',
  GOOD: 'badge-blue',
  FAIR: 'badge-yellow',
  POOR: 'badge-red',
  DAMAGED: 'badge-red',
  HIGH: 'badge-red',
  MEDIUM: 'badge-yellow',
  LOW: 'badge-green',
  RETURNED: 'badge-green',
  TRANSFERRED: 'badge-purple',
  VERIFIED: 'badge-green',
  DISCREPANCY: 'badge-red',
  OVERDUE: 'badge-red',
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const className = statusConfig[status] || 'badge-gray';
  const displayLabel = label || status.replace(/_/g, ' ').toLowerCase();
  return <span className={`badge ${className}`}>{displayLabel}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, string> = {
    LOW: 'badge-green',
    MEDIUM: 'badge-yellow',
    HIGH: 'badge-red',
    CRITICAL: 'badge-red',
  };
  return <span className={`badge ${config[priority] || 'badge-gray'}`}>{priority}</span>;
}
