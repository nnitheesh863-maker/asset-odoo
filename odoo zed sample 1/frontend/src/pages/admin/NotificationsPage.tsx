import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../services/api';
import { Notification } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchNotifications = (page = 1) => {
    setLoading(true);
    api.get('/notifications', { params: { page, limit: 10 } })
      .then(res => {
        if (res.data.success) {
          setNotifications(res.data.data.notifications);
          setUnreadCount(res.data.data.unreadCount);
          setPagination(res.data.pagination);
        }
      })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const typeColors: Record<string, string> = {
    TRANSFER_REQUEST: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    MAINTENANCE_REQUEST: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
    BOOKING: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
    RETURN_DUE: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
    OVERDUE: 'bg-red-100 text-red-600 dark:bg-red-900/30',
    GENERAL: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center space-x-2">
            <CheckCheck size={16} /><span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-20 w-full" />)}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.readStatus && markAsRead(n.id)}
              className={`glass-card-solid p-4 cursor-pointer hover:shadow-lg transition-all ${
                !n.readStatus ? 'border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-900/10' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-xl ${typeColors[n.type] || typeColors.GENERAL}`}>
                  <Bell size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm ${!n.readStatus ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-white`}>{n.title}</h3>
                    <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchNotifications} />
      )}
    </div>
  );
}
