import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightLeft,
} from 'lucide-react';
import transferService from '@/services/transferService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Tabs from '@/components/common/Tabs';
import DataTable from '@/components/ui/DataTable';
import { useAuthContext } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatters';

export default function TransferListPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState('');
  const [acting, setActing] = useState(false);

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const tabs = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
    { key: 'all', label: 'All', icon: ArrowRightLeft },
  ];

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: activeTab === 'all' ? undefined : activeTab,
      };
      const res = await transferService.getAll(params);
      setTransfers(res.data?.transfers || res.data || res.transfers || []);
      setTotalItems(res.data?.total || res.total || res.data?.pagination?.total || 0);
    } catch {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, activeTab]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const handleAction = async () => {
    if (!actionTarget) return;
    setActing(true);
    try {
      if (actionType === 'approve') {
        await transferService.approve(actionTarget.id);
        toast.success('Transfer approved');
      } else {
        await transferService.reject(actionTarget.id);
        toast.success('Transfer rejected');
      }
      setActionTarget(null);
      setActionType('');
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const columns = [
    {
      key: 'asset',
      label: 'Asset',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {row.asset?.name || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {row.asset?.assetTag || row.asset?.assetCode || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'fromUser',
      label: 'From User',
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.fromEmployee
            ? `${row.fromEmployee.firstName || ''} ${row.fromEmployee.lastName || ''}`
            : row.fromUser || 'N/A'}
        </span>
      ),
    },
    {
      key: 'toUser',
      label: 'To User',
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.toEmployee
            ? `${row.toEmployee.firstName || ''} ${row.toEmployee.lastName || ''}`
            : row.toUser || 'N/A'}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.toDepartment?.name || row.department || 'N/A'}
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
      label: 'Requested Date',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/transfers/${row.id}`);
            }}
            className="btn btn-ghost btn-sm"
          >
            View
          </button>
          {isManager && row.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionTarget(row);
                  setActionType('approve');
                }}
                className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionTarget(row);
                  setActionType('reject');
                }}
                className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Transfers"
        subtitle="Manage asset transfer requests"
        icon={Truck}
        actionLabel="New Transfer"
        onAction={() => navigate('/transfers/new')}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search transfers..."
          className="w-full sm:w-72"
        />
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
      />

      <div className="mt-4">
        {loading ? (
          <LoadingSpinner centered />
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No transfers found"
            description="Create a transfer request to get started"
            actionLabel="New Transfer"
            onAction={() => navigate('/transfers/new')}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={transfers}
              onRowClick={(row) => navigate(`/transfers/${row.id}`)}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
              onLimitChange={setLimit}
              limit={limit}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!actionTarget}
        title={actionType === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}
        message={
          actionType === 'approve'
            ? `Approve the transfer of "${actionTarget?.asset?.name || ''}"?`
            : `Reject the transfer of "${actionTarget?.asset?.name || ''}"?`
        }
        confirmLabel={acting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
        onConfirm={handleAction}
        onCancel={() => {
          setActionTarget(null);
          setActionType('');
        }}
        variant={actionType === 'approve' ? 'info' : 'danger'}
      />
    </div>
  );
}
