import React, { useState, useEffect } from 'react';
import {
  Package, CheckCircle, XCircle, Wrench, AlertTriangle, CalendarClock,
  Clock, AlertCircle, ArrowRight, TrendingUp, Building2, Users, Activity,
  FileSearch, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, type: 'spring' as const, stiffness: 100, damping: 15 },
  }),
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => { if (res.data.success) setData(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const deptData = data?.departmentDistribution || [];
  const catData = data?.categoryDistribution || [];
  const activity = data?.recentActivity || [];

  const kpis = [
    { label: 'Total Assets', value: stats.totalAssets || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', glow: 'shadow-blue-500/10' },
    { label: 'Available', value: stats.availableAssets || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', glow: 'shadow-emerald-500/10' },
    { label: 'Allocated', value: stats.allocatedAssets || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', glow: 'shadow-purple-500/10' },
    { label: 'Under Maintenance', value: stats.underMaintenance || 0, icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', glow: 'shadow-yellow-500/10' },
    { label: 'Lost Assets', value: stats.lostAssets || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', glow: 'shadow-red-500/10' },
    { label: 'Active Bookings', value: stats.activeBookings || 0, icon: CalendarClock, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', glow: 'shadow-cyan-500/10' },
    { label: 'Pending Maintenance', value: stats.pendingMaintenance || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', glow: 'shadow-orange-500/10' },
    { label: 'Pending Transfers', value: stats.pendingTransfers || 0, icon: ArrowRight, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', glow: 'shadow-indigo-500/10' },
    { label: 'Upcoming Returns', value: stats.upcomingReturns || 0, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', glow: 'shadow-teal-500/10' },
    { label: 'Overdue Returns', value: stats.overdueReturns || 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', glow: 'shadow-rose-500/10' },
    { label: 'Departments', value: stats.totalDepartments || 0, icon: Building2, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', glow: 'shadow-violet-500/10' },
    { label: 'Employees', value: stats.totalEmployees || 0, icon: Shield, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20', glow: 'shadow-sky-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Organization-wide asset management overview</p>
        </div>
        <span className="badge bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Administrator</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`glass-card-solid p-5 cursor-default ${card.glow} hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon size={24} className={card.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Distribution</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No data</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Categories</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={catData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, count }) => `${name}: ${count}`}>
                  {catData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No data</p>}
        </motion.div>
      </div>

      {/* Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card-solid p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Activity size={20} />
          <span>Recent Activity</span>
        </h3>
        {activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((log: any) => (
              <div key={log.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{log.user?.name}</span>
                    <span className="text-gray-500"> performed </span>
                    <span className="font-medium text-primary-600">{log.action}</span>
                    <span className="text-gray-500"> on </span>
                    <span className="font-medium">{log.module}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-center py-8">No recent activity</p>}
      </motion.div>
    </div>
  );
}
