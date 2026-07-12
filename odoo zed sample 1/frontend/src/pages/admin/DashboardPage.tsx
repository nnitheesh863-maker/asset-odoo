import React, { useState, useEffect } from 'react';
import {
  Package, CheckCircle, XCircle, Wrench, AlertTriangle, CalendarClock,
  Clock, AlertCircle, ArrowRight, TrendingUp, Building2, Users, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { DashboardStats } from '../../types';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';
import { StatusBadge } from '../../components/ui/StatusBadge';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [catData, setCatData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      if (res.data.success) {
        const d = res.data.data;
        setStats(d.stats);
        setDeptData(d.departmentDistribution || []);
        setCatData(d.categoryDistribution || []);
        setRecentActivity(d.recentActivity || []);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { label: 'Total Assets', value: stats?.totalAssets || 0, icon: Package, color: 'bg-blue-500', lightColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600' },
    { label: 'Available', value: stats?.availableAssets || 0, icon: CheckCircle, color: 'bg-emerald-500', lightColor: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600' },
    { label: 'Allocated', value: stats?.allocatedAssets || 0, icon: Users, color: 'bg-purple-500', lightColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600' },
    { label: 'Under Maintenance', value: stats?.underMaintenance || 0, icon: Wrench, color: 'bg-yellow-500', lightColor: 'bg-yellow-50 dark:bg-yellow-900/20', textColor: 'text-yellow-600' },
    { label: 'Lost', value: stats?.lostAssets || 0, icon: AlertTriangle, color: 'bg-red-500', lightColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-600' },
    { label: 'Active Bookings', value: stats?.activeBookings || 0, icon: CalendarClock, color: 'bg-cyan-500', lightColor: 'bg-cyan-50 dark:bg-cyan-900/20', textColor: 'text-cyan-600' },
    { label: 'Pending Maintenance', value: stats?.pendingMaintenance || 0, icon: Clock, color: 'bg-orange-500', lightColor: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-600' },
    { label: 'Pending Transfers', value: stats?.pendingTransfers || 0, icon: ArrowRight, color: 'bg-indigo-500', lightColor: 'bg-indigo-50 dark:bg-indigo-900/20', textColor: 'text-indigo-600' },
    { label: 'Upcoming Returns', value: stats?.upcomingReturns || 0, icon: TrendingUp, color: 'bg-teal-500', lightColor: 'bg-teal-50 dark:bg-teal-900/20', textColor: 'text-teal-600' },
    { label: 'Overdue Returns', value: stats?.overdueReturns || 0, icon: AlertCircle, color: 'bg-rose-500', lightColor: 'bg-rose-50 dark:bg-rose-900/20', textColor: 'text-rose-600' },
    { label: 'Departments', value: stats?.totalDepartments || 0, icon: Building2, color: 'bg-violet-500', lightColor: 'bg-violet-50 dark:bg-violet-900/20', textColor: 'text-violet-600' },
    { label: 'Employees', value: stats?.totalEmployees || 0, icon: Users, color: 'bg-sky-500', lightColor: 'bg-sky-50 dark:bg-sky-900/20', textColor: 'text-sky-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Overview of your asset management system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card-solid p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.lightColor}`}>
                <card.icon size={24} className={card.textColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-solid p-6">
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
          ) : (
            <p className="text-gray-400 text-center py-12">No data available</p>
          )}
        </div>

        <div className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Categories</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={catData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, count }) => `${name}: ${count}`}>
                  {catData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      <div className="glass-card-solid p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Activity size={20} />
          <span>Recent Activity</span>
        </h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((log) => (
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
        ) : (
          <p className="text-gray-400 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
}
