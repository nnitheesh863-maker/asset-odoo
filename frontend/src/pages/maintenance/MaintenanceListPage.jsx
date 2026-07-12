import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench,
  Plus,
  Eye,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import maintenanceService from '@/services/maintenanceService';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import Tabs from '@/components/common/Tabs';
import SearchInput from '@/components/common/SearchInput';
import Select from '@/components/common/Select';
import StatusBadge from '@/components/common/StatusBadge';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, getPriorityColor } from '@/utils/formatters';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'requested', label: 'Requested' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const STATUS_FLOW = ['requested', 'in_progress', 'completed'];

function getNextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

function formatPriorityLabel(p) {
  if (!p) return '';
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export default function MaintenanceListPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [stats, setStats] = useState({ total: 0, requested: 0, inProgress: 0, completed: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (activeTab !== 'all') params.status = activeTab;
      if (search) params.search = search;
      if (priority) params.priority = priority;

      const res = await maintenanceService.getAll(params);
      const data = res?.data || res;
      setRequests(Array.isArray(data) ? data : data?.requests || []);
      setTotalItems(data?.total || data?.totalCount || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab, search, priority]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await maintenanceService.getStats();
      const data = res?.data || res;
      setStats({
        total: data?.total || 0,
        requested: data?.requested || data?.pending || 0,
        inProgress: data?.inProgress || data?.in_progress || 0,
        completed: data?.completed || 0,
      });
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, priority]);

  const handleQuickStatusUpdate = async (id, currentStatus) => {
    const next = getNextStatus(currentStatus);
    if (!next) return;
    setUpdatingId(id);
    try {
      await maintenanceService.updateStatus(id, next);
      toast.success(`Status updated to ${next.replace('_', ' ')}`);
      fetchRequests();
      fetchStats();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const columns = [
    {
      key: 'asset',
      label: 'Asset',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">
            {row.asset?.name || row.assetName || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Issue',
      sortable: true,
      render: (val, row) => (
        <span className="text-gray-600 dark:text-gray-400 line-clamp-1">
          {val || row.description || 'No description'}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val) => {
        const color = getPriorityColor(val);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
            {formatPriorityLabel(val)}
          </span>
        );
      },
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (val, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.assignedTechnician?.name || row.assignedTo || val || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(val)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const next = getNextStatus(row.status);
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/maintenance/${row.id || row._id}`);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            {next && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickStatusUpdate(row.id || row._id, row.status);
                }}
                disabled={updatingId === (row.id || row._id)}
                className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 transition-colors disabled:opacity-50"
                title={`Move to ${next.replace('_', ' ')}`}
              >
                {updatingId === (row.id || row._id) ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Maintenance"
        subtitle="Manage maintenance requests and track repairs"
        icon={Wrench}
        actionLabel="New Request"
        onAction={() => navigate('/maintenance/new')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total" value={stats.total} icon={Wrench} color="blue" />
        <StatsCard title="Requested" value={stats.requested} icon={Clock} color="amber" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={AlertTriangle} color="purple" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
      </div>

      <div className="mb-4">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search maintenance requests..."
          className="w-full sm:w-64"
        />
        <div className="flex items-center gap-2">
          <Select
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
            placeholder="Priority"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests"
          description="No requests found matching your filters. Create a new request to get started."
          actionLabel="New Request"
          onAction={() => navigate('/maintenance/new')}
        />
      ) : (
        <>
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {requests.map((row) => (
                  <tr
                    key={row.id || row._id}
                    onClick={() => navigate(`/maintenance/${row.id || row._id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            limit={limit}
          />
        </>
      )}
    </motion.div>
  );
}
