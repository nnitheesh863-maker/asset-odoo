import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package,
  Users,
  Wrench,
  Clock,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  CalendarCheck,
  LayoutGrid,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatsCard from '@/components/common/StatsCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { PieChart, BarChart } from '@/components/ui/Charts';
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

export default function ManagerDashboard() {
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
      const response = await dashboardService.getManagerDashboard();
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
  const pendingRequests = data?.pendingRequests || [];
  const upcomingMaintenance = data?.upcomingMaintenance || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="page-title">Manager Dashboard</h1>
        <p className="page-subtitle">Department overview and management</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Department Assets"
          value={stats.departmentAssets ?? 0}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Team Members"
          value={stats.teamMembers ?? 0}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Active Maintenance"
          value={stats.activeMaintenance ?? 0}
          icon={Wrench}
          color="amber"
        />
        <StatsCard
          title="Utilization Rate"
          value={`${stats.utilizationRate ?? 0}%`}
          icon={BarChart3}
          color="purple"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary-500" />
            Department Assets by Category
          </h3>
          <BarChart
            data={charts.assetsByCategory || []}
            xKey="category"
            yKey="count"
            color="#3b82f6"
            height={280}
          />
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary-500" />
            Department Utilization
          </h3>
          <PieChart
            data={charts.utilization || []}
            nameKey="label"
            valueKey="count"
            height={280}
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary-500" />
              Pending Requests
            </h3>
            {pendingRequests.length > 0 && (
              <Link
                to="/requests"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {pendingRequests.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No pending requests
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pendingRequests.slice(0, 5).map((request, idx) => (
                <div key={request.id || idx} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {request.title || request.assetName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {request.type} &middot; {request.requestedBy}
                      </p>
                    </div>
                    <StatusBadge status={request.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary-500" />
              Upcoming Maintenance
            </h3>
            <Link
              to="/maintenance"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {upcomingMaintenance.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No upcoming maintenance
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {upcomingMaintenance.slice(0, 5).map((item, idx) => (
                <div key={item.id || idx} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {item.assetName || item.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {item.type} &middot; {formatDate(item.scheduledDate)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/assets"
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Manage Assets
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View and manage department assets</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            to="/employees"
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="rounded-xl bg-green-100 dark:bg-green-900/30 p-3">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Team Members
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View team and allocations</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            to="/maintenance"
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-3">
              <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Maintenance
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Schedule and track maintenance</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
