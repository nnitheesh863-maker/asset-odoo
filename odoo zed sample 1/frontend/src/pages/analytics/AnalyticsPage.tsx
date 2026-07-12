import React, { useState, useEffect } from 'react';
import { BarChart3, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import api from '../../services/api';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/analytics')
      .then(res => { if (res.data.success) setData(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>;

  const lifecycleData = data?.lifecycleStats?.map((s: any) => ({ name: s.status.replace(/_/g, ' '), value: s._count })) || [];
  const maintenanceData = data?.maintenanceByPriority?.map((s: any) => ({ name: s.priority, count: s._count })) || [];
  const deptAllocation = data?.departmentAllocation || [];
  const bookingStats = data?.bookingStats?.map((s: any) => ({ name: s.status, count: s._count })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Comprehensive asset analytics and insights</p>
        </div>
        <button onClick={() => toast('Export feature coming soon!')} className="btn-secondary flex items-center space-x-2">
          <Download size={16} /><span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Lifecycle Distribution</h3>
          {lifecycleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={lifecycleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                  {lifecycleData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No data</p>}
        </div>

        <div className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance by Priority</h3>
          {maintenanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No data</p>}
        </div>

        <div className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Allocation</h3>
          {deptAllocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptAllocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No data</p>}
        </div>

        <div className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Statistics</h3>
          {bookingStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={bookingStats} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {bookingStats.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No data</p>}
        </div>
      </div>
    </div>
  );
}

function toast(msg: string) { alert(msg); }
