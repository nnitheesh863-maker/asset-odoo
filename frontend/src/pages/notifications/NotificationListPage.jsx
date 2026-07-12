import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Wrench,
  Package,
  Users,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import notificationService from '@/services/notificationService';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { formatRelativeTime } from '@/utils/formatters';

const TYPE_ICONS = {
  alert: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  maintenance: Wrench,
  asset: Package,
  employee: Users,
  system: Settings,
  default: Bell,
};

function getIconForType(type) {
  if (!type) return TYPE_ICONS.default;
  const normalized = type.toLowerCase();
  for (const [key, Icon] of Object.entries(TYPE_ICONS)) {
    if (normalized.includes(key)) return Icon;
  }
  return TYPE_ICONS.default;
}

function getIconColor(type) {
  if (!type) return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
  const normalized = type.toLowerCase();
  if (normalized.includes('alert') || normalized.includes('warning')) return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
  if (normalized.includes('error') || normalized.includes('critical')) return 'text-red-500 bg-red-100 dark:bg-red-900/30';
  if (normalized.includes('success') || normalized.includes('completed')) return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';
  if (normalized.includes('info')) return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
  if (normalized.includes('maintenance')) return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
  return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
}

export default function NotificationListPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(15);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ page, limit });
      const data = res?.data || res;
      setNotifications(Array.isArray(data) ? data : data?.notifications || []);
      setTotalItems(data?.total || data?.totalCount || (Array.isArray(data) ? data.length : 0));
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      const data = res?.data || res;
      setUnreadCount(data?.count || data?.unreadCount || 0);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await notificationService.remove(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleNotificationClick = (notification) => {
    const id = notification.id || notification._id;
    const isRead = notification.read || notification.isRead;
    if (!isRead) {
      handleMarkAsRead(id);
    }
    if (notification.link || notification.route) {
      navigate(notification.link || notification.route);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        icon={Bell}
      >
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="btn btn-secondary flex items-center gap-2"
          >
            {markingAll ? (
              <LoadingSpinner size="sm" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark All as Read
          </button>
        )}
      </PageHeader>

      {loading ? (
        <LoadingSpinner centered />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <>
          <div className="card divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notification) => {
              const id = notification.id || notification._id;
              const isRead = notification.read || notification.isRead;
              const Icon = getIconForType(notification.type || notification.category);
              const iconColor = getIconColor(notification.type || notification.category);

              return (
                <div
                  key={id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    !isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 rounded-full p-2 ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`text-sm ${
                            !isRead
                              ? 'font-semibold text-gray-900 dark:text-white'
                              : 'font-medium text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {notification.title || notification.message || 'Notification'}
                        </p>
                        {notification.message && notification.title && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Unread dot */}
                        {!isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                        )}

                        {/* Time */}
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatRelativeTime(notification.createdAt || notification.timestamp)}
                        </span>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(id);
                          }}
                          disabled={deletingId === id}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          {deletingId === id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            limit={limit}
          />
        </>
      )}
    </motion.div>
  );
}
