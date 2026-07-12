import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  UserCheck,
  Wrench,
  AlertTriangle,
  Users,
  Building2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatsCard from '@/components/common/StatsCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { AreaChart, PieChart, LineChart, BarChart } from '@/components/ui/Charts';
import dashboardService from '@/services/dashboardService';
import { formatCurrency, formatDate } from '@/utils/formatters';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
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
      const response = await dashboardService.getAdminDashboard();
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
  const charts = data?.charts || {};
  const recentActivities = data?.recentActivities || [];
  const pendingRequests = data?.pendingRequests || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of your organization's assets</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Assets"
          value={stats.totalAssets ?? 0}
          icon={Package}
          color="blue"
          trend={stats.assetsTrend}
          trendValue={stats.assetsTrendValue}
        />
        <StatsCard
          title="Available"
          value={stats.availableAssets ?? 0}
          icon={CheckCircle}
          color="green"
          trend={stats.availableTrend}
          trendValue={stats.availableTrendValue}
        />
        <StatsCard
          title="Assigned"
          value={stats.assignedAssets ?? 0}
          icon={UserCheck}
          color="purple"
        />
        <StatsCard
          title="Under Maintenance"
          value={stats.maintenanceAssets ?? 0}
          icon={Wrench}
          color="amber"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Lost Assets"
          value={stats.lostAssets ?? 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees ?? 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Departments"
          value={stats.totalDepartments ?? 0}
          icon={Building2}
          color="purple"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            Monthly Asset Growth
          </h3>
          <AreaChart
            data={charts.monthlyAssetGrowth || []}
            xKey="month"
            yKey="count"
            color="#3b82f6"
            height={280}
          />
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary-500" />
            Assets by Status
          </h3>
          <PieChart
            data={charts.assetsByStatus || []}
            nameKey="status"
            valueKey="count"
            height={280}
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            Maintenance Cost Trend
          </h3>
          <LineChart
            data={charts.maintenanceCostTrend || []}
            xKey="month"
            yKey="cost"
            color="#f59e0b"
            height={280}
          />
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary-500" />
            Assets by Category
          </h3>
          <BarChart
            data={charts.assetsByCategory || []}
            xKey="category"
            yKey="count"
            color="#8b5cf6"
            height={280}
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary-500" />
              Recent Activities
            </h3>
          </div>
          {recentActivities.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No recent activities
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {recentActivities.slice(0, 10).map((activity, idx) => (
                    <tr key={activity.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="table-cell text-sm text-gray-700 dark:text-gray-300 max-w-[250px] truncate">
                        {activity.description}
                      </td>
                      <td className="table-cell text-sm text-gray-500 dark:text-gray-400">
                        {activity.userName || 'System'}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={activity.type} size="sm" />
                      </td>
                      <td className="table-cell text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(activity.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pending Requests</h3>
          </div>
          {pendingRequests.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No pending requests
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pendingRequests.slice(0, 5).map((request, idx) => (
                <div key={request.id || idx} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {request.title || request.assetName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {request.type} &middot; {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={request.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {pendingRequests.length > 0 && (
            <Link
              to="/requests"
              className="flex items-center justify-center gap-1 px-6 py-3 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
