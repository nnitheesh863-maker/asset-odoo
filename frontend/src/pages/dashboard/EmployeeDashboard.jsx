import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package,
  CalendarCheck,
  Wrench,
  Bell,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Clock,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatsCard from '@/components/common/StatsCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import StatusBadge from '@/components/common/StatusBadge';
import dashboardService from '@/services/dashboardService';
import { formatDate } from '@/utils/formatters';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getEmployeeDashboard();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner centered size="lg" />;

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={fetchDashboard} className="btn btn-primary">
          Try again
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const myAssets = data?.myAssets || [];
  const myBookings = data?.myBookings || [];
  const myMaintenanceRequests = data?.myMaintenanceRequests || [];
  const notifications = data?.notifications || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="page-title">My Dashboard</h1>
        <p className="page-subtitle">Your assigned assets and activities</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="My Assets"
          value={stats.assignedAssets ?? 0}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Active Bookings"
          value={stats.activeBookings ?? 0}
          icon={CalendarCheck}
          color="green"
        />
        <StatsCard
          title="Maintenance Requests"
          value={stats.maintenanceRequests ?? 0}
          icon={Wrench}
          color="amber"
        />
        <StatsCard
          title="Notifications"
          value={stats.unreadNotifications ?? 0}
          icon={Bell}
          color="purple"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/assets"
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
              Browse Assets
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Find and request assets</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          to="/bookings"
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <div className="rounded-xl bg-green-100 dark:bg-green-900/30 p-3">
            <CalendarCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
              My Bookings
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">View and manage bookings</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          to="/maintenance"
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-3">
            <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
              Request Maintenance
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Report an issue</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary-500" />
              My Assigned Assets
            </h3>
          </div>
          {myAssets.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No assigned assets"
              description="You don't have any assets assigned to you yet"
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {myAssets.slice(0, 5).map((asset, idx) => (
                <div key={asset.id || idx} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {asset.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {asset.assetTag} &middot; {asset.category}
                      </p>
                    </div>
                    <StatusBadge status={asset.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary-500" />
              My Bookings
            </h3>
          </div>
          {myBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings"
              description="You haven't made any asset bookings yet"
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {myBookings.slice(0, 5).map((booking, idx) => (
                <div key={booking.id || idx} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {booking.assetName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary-500" />
              My Maintenance Requests
            </h3>
          </div>
          {myMaintenanceRequests.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No maintenance requests"
              description="You haven't submitted any maintenance requests"
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {myMaintenanceRequests.slice(0, 5).map((req, idx) => (
                <div key={req.id || idx} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {req.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {req.assetName} &middot; {formatDate(req.scheduledDate)}
                      </p>
                    </div>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary-500" />
              Recent Notifications
            </h3>
          </div>
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up!"
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.slice(0, 5).map((notif, idx) => (
                <div
                  key={notif.id || idx}
                  className={`px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                    !notif.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {!notif.read ? (
                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {notif.title || notif.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
