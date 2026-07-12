import React, { useState, useEffect } from 'react';
import {
  Package, Wrench, ArrowLeftRight, CheckCircle, Clock, AlertTriangle,
  TrendingUp, BarChart3, ShieldCheck, ClipboardList, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, type: 'spring' as const, stiffness: 100, damping: 15 },
  }),
};

export default function ManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/manager')
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const recentAssets = data?.recentAssets || [];
  const catData = data?.categoryDistribution || [];
  const conditionData = data?.conditionDistribution || [];

  const kpis = [
    { label: 'Total Assets', value: stats.totalAssets || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Available', value: stats.availableAssets || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Under Maintenance', value: stats.underMaintenance || 0, icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Pending Maintenance', value: stats.pendingMaintenance || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Pending Transfers', value: stats.pendingTransfers || 0, icon: ArrowLeftRight, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Overdue Returns', value: stats.overdueReturns || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Manager Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage, allocate, and maintain organizational assets</p>
        </div>
        <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Asset Manager</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Categories</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={catData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {catData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-8">No data</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Conditions</h3>
          {conditionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conditionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-8">No data</p>}
        </motion.div>
      </div>

      {/* Recent Assets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card-solid p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Package size={18} className="text-blue-500" />
          <span>Recently Registered Assets</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="table-header">Asset Tag</th>
                <th className="table-header">Name</th>
                <th className="table-header">Category</th>
                <th className="table-header">Status</th>
                <th className="table-header">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {recentAssets.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="table-cell"><code className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 px-2 py-0.5 rounded">{a.assetTag}</code></td>
                  <td className="table-cell font-medium">{a.assetName}</td>
                  <td className="table-cell text-sm text-gray-500">{a.category?.name || '—'}</td>
                  <td className="table-cell"><StatusBadge status={a.status} /></td>
                  <td className="table-cell text-sm">{a.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
