import React, { useState, useEffect } from 'react';
import {
  Package, Users, ArrowLeftRight, CalendarClock, BarChart3,
  CheckCircle, Clock, AlertTriangle, Building2, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
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

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/department')
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const deptAssets = data?.deptAssets || [];
  const pendingTransfers = data?.pendingTransfers || [];
  const bookings = data?.bookings || [];

  const kpis = [
    { label: 'Department Assets', value: stats.departmentAssets || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Department Employees', value: stats.departmentEmployees || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Transfers', value: stats.pendingTransfers || 0, icon: ArrowLeftRight, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Allocated Assets', value: stats.allocatedAssets || 0, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.department?.name || 'Department'} Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage department assets, transfers, and bookings</p>
        </div>
        <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Department Head</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3 }}
            className="glass-card-solid p-5 hover:shadow-lg transition-shadow"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Transfers for Approval */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <ArrowLeftRight size={18} className="text-purple-500" />
            <span>Pending Transfer Requests</span>
          </h3>
          <div className="space-y-3">
            {pendingTransfers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No pending transfer requests</p>
            ) : (
              pendingTransfers.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.asset?.assetTag} — {t.asset?.assetName}</p>
                    <p className="text-xs text-gray-500">{t.currentHolder?.name} → {t.newHolder?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.reason}</p>
                  </div>
                  <StatusBadge status={t.approvalStatus} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Department Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <CalendarClock size={18} className="text-cyan-500" />
            <span>Resource Bookings</span>
          </h3>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No bookings</p>
            ) : (
              bookings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{b.asset?.assetTag} — {b.asset?.assetName}</p>
                    <p className="text-xs text-gray-500">{b.employee?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(b.startTime).toLocaleDateString()} - {new Date(b.endTime).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Department Assets Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card-solid p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Building2 size={18} className="text-blue-500" />
          <span>Department Assets</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="table-header">Asset Tag</th>
                <th className="table-header">Name</th>
                <th className="table-header">Category</th>
                <th className="table-header">Status</th>
                <th className="table-header">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {deptAssets.slice(0, 8).map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="table-cell"><code className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 px-2 py-0.5 rounded">{a.assetTag}</code></td>
                  <td className="table-cell font-medium">{a.assetName}</td>
                  <td className="table-cell text-sm text-gray-500">{a.category?.name || '—'}</td>
                  <td className="table-cell"><StatusBadge status={a.status} /></td>
                  <td className="table-cell text-sm text-gray-500">{a.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
