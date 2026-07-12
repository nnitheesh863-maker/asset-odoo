import React, { useState, useEffect } from 'react';
import {
  Package, CalendarClock, Wrench, ArrowLeftRight, Clock, Bell,
  CheckCircle, AlertTriangle, RotateCcw, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, type: 'spring' as const, stiffness: 100, damping: 15 },
  }),
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/employee')
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const myAssets = data?.myAssets || [];
  const bookings = data?.bookings || [];
  const maintenance = data?.maintenance || [];
  const transfers = data?.transfers || [];
  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const kpis = [
    { label: 'My Assets', value: myAssets.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Bookings', value: bookings.filter((b: any) => ['CONFIRMED', 'ACTIVE'].includes(b.status)).length, icon: CalendarClock, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { label: 'My Maintenance', value: maintenance.length, icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'My Transfers', value: transfers.length, icon: ArrowLeftRight, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Unread Notifications', value: unreadCount, icon: Bell, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">View your assets, bookings, and requests</p>
        </div>
        <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Employee</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3 }}
            className="glass-card-solid p-4 hover:shadow-lg transition-shadow"
          >
            <div className={`p-2 rounded-lg ${card.bg} w-fit mb-2`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        {[
          { to: '/maintenance', icon: Wrench, label: 'Raise Maintenance', color: 'bg-orange-500 hover:bg-orange-600' },
          { to: '/bookings', icon: CalendarClock, label: 'Book Resource', color: 'bg-cyan-500 hover:bg-cyan-600' },
          { to: '/transfers', icon: ArrowLeftRight, label: 'Request Transfer', color: 'bg-purple-500 hover:bg-purple-600' },
          { to: '/notifications', icon: Bell, label: `Notifications (${unreadCount})`, color: 'bg-rose-500 hover:bg-rose-600' },
        ].map(action => (
          <Link
            key={action.label}
            to={action.to}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${action.color}`}
          >
            <action.icon size={16} />
            <span>{action.label}</span>
          </Link>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Allocated Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Package size={18} className="text-blue-500" />
            <span>My Assets</span>
          </h3>
          <div className="space-y-3">
            {myAssets.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No assets allocated</p>
            ) : (
              myAssets.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.assetName}</p>
                    <p className="text-xs text-gray-500">{a.assetTag} • {a.location}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* My Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <CalendarClock size={18} className="text-cyan-500" />
            <span>My Bookings</span>
          </h3>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No bookings</p>
            ) : (
              bookings.slice(0, 5).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{b.asset?.assetName}</p>
                    <p className="text-xs text-gray-500">{new Date(b.startTime).toLocaleDateString()} - {new Date(b.endTime).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Maintenance Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Wrench size={18} className="text-orange-500" />
            <span>My Maintenance Requests</span>
          </h3>
          <div className="space-y-3">
            {maintenance.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No maintenance requests</p>
            ) : (
              maintenance.slice(0, 5).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.asset?.assetTag} — {m.asset?.assetName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{m.issue}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={m.approvalStatus} />
                    <StatusBadge status={m.progressStatus} />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Bell size={18} className="text-rose-500" />
            <span>Recent Notifications</span>
          </h3>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No notifications</p>
            ) : (
              notifications.slice(0, 5).map((n: any) => (
                <div key={n.id} className={`p-3 rounded-xl ${!n.readStatus ? 'bg-primary-50/50 dark:bg-primary-900/10 border-l-2 border-primary-500' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
