import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import auditService from '@/services/auditService';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import StatusBadge from '@/components/common/StatusBadge';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/utils/formatters';

export default function AuditListPage() {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, discrepancies: 0 });

  const fetchCycles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditService.getCycles({ page, limit });
      const data = res?.data || res;
      setCycles(Array.isArray(data) ? data : data?.cycles || []);
      setTotalItems(data?.total || data?.totalCount || (Array.isArray(data) ? data.length : 0));
    } catch {
      toast.error('Failed to load audit cycles');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await auditService.getStats();
      const data = res?.data || res;
      setStats({
        total: data?.total || 0,
        completed: data?.completed || 0,
        inProgress: data?.inProgress || data?.in_progress || 0,
        discrepancies: data?.discrepancies || 0,
      });
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-gray-900 dark:text-white">{val}</span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (val, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.department?.name || row.departmentName || val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(val)}</span>
      ),
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(val)}</span>
      ),
    },
    {
      key: 'itemsCount',
      label: 'Items',
      sortable: true,
      render: (val, row) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {val || row.items?.length || 0}
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
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/audit/${row.id || row._id}`);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Audit Cycles"
        subtitle="Manage asset audit cycles and verification"
        icon={ClipboardCheck}
        actionLabel="New Audit Cycle"
        onAction={() => navigate('/audit/new')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Cycles" value={stats.total} icon={ClipboardCheck} color="blue" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} color="amber" />
        <StatsCard title="Discrepancies" value={stats.discrepancies} icon={AlertTriangle} color="red" />
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : cycles.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No audit cycles"
          description="Create your first audit cycle to begin asset verification."
          actionLabel="New Audit Cycle"
          onAction={() => navigate('/audit/new')}
        />
      ) : (
        <>
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[700px]">
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
                {cycles.map((row) => (
                  <tr
                    key={row.id || row._id}
                    onClick={() => navigate(`/audit/${row.id || row._id}`)}
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
