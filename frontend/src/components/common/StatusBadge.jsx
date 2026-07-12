import { clsx } from 'clsx';

const statusColorMap = {
  active: 'badge-success',
  completed: 'badge-success',
  approved: 'badge-success',
  operational: 'badge-success',
  online: 'badge-success',
  available: 'badge-success',
  good: 'badge-success',

  pending: 'badge-warning',
  in_progress: 'badge-warning',
  'in-progress': 'badge-warning',
  review: 'badge-warning',
  scheduled: 'badge-warning',
  partial: 'badge-warning',
  maintenance: 'badge-warning',
  warning: 'badge-warning',
  idle: 'badge-warning',

  failed: 'badge-danger',
  rejected: 'badge-danger',
  overdue: 'badge-danger',
  error: 'badge-danger',
  critical: 'badge-danger',
  offline: 'badge-danger',
  decommissioned: 'badge-danger',
  inactive: 'badge-danger',
  expired: 'badge-danger',

  info: 'badge-info',
  draft: 'badge-info',
  new: 'badge-info',
  open: 'badge-info',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
};

function formatStatus(status) {
  return status
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = status?.toLowerCase() || '';
  const badgeClass = statusColorMap[normalized] || 'badge-neutral';

  return (
    <span className={clsx('badge', badgeClass, sizeClasses[size])}>
      {formatStatus(status)}
    </span>
  );
}
