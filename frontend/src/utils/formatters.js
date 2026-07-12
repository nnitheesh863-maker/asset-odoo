import { format, formatDistanceToNow, parseISO } from 'date-fns';
import clsx from 'clsx';

export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return format(parsed, formatStr);
  } catch {
    return String(date);
  }
}

export function formatDateTime(date) {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(number) {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(number);
}

export function getStatusColor(status) {
  const colors = {
    active: 'text-green-700 bg-green-50 border-green-200',
    inactive: 'text-gray-700 bg-gray-50 border-gray-200',
    available: 'text-green-700 bg-green-50 border-green-200',
    allocated: 'text-blue-700 bg-blue-50 border-blue-200',
    maintenance: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    retired: 'text-red-700 bg-red-50 border-red-200',
    lost: 'text-red-700 bg-red-50 border-red-200',
    disposed: 'text-gray-700 bg-gray-50 border-gray-200',
    pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    approved: 'text-green-700 bg-green-50 border-green-200',
    rejected: 'text-red-700 bg-red-50 border-red-200',
    completed: 'text-green-700 bg-green-50 border-green-200',
    cancelled: 'text-gray-700 bg-gray-50 border-gray-200',
    in_progress: 'text-blue-700 bg-blue-50 border-blue-200',
    overdue: 'text-red-700 bg-red-50 border-red-200',
    scheduled: 'text-purple-700 bg-purple-50 border-purple-200',
    open: 'text-blue-700 bg-blue-50 border-blue-200',
    closed: 'text-gray-700 bg-gray-50 border-gray-200',
    resolved: 'text-green-700 bg-green-50 border-green-200',
  };
  return colors[status] || 'text-gray-700 bg-gray-50 border-gray-200';
}

export function getPriorityColor(priority) {
  const colors = {
    low: 'text-blue-700 bg-blue-50 border-blue-200',
    medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    high: 'text-orange-700 bg-orange-50 border-orange-200',
    critical: 'text-red-700 bg-red-50 border-red-200',
  };
  return colors[priority] || 'text-gray-700 bg-gray-50 border-gray-200';
}

export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function classNames(...args) {
  return clsx(...args);
}

export function formatRelativeTime(date) {
  if (!date) return '';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return String(date);
  }
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}
