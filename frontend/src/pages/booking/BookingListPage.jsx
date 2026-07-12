import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  Ban,
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import Select from '@/components/common/Select';
import StatusBadge from '@/components/common/StatusBadge';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Tabs from '@/components/common/Tabs';
import DataTable from '@/components/ui/DataTable';
import DateRangePicker from '@/components/common/DateRangePicker';
import { useAuthContext } from '@/context/AuthContext';
import { formatDate, formatDateTime } from '@/utils/formatters';

export default function BookingListPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('mine');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [resourceTypeFilter, setResourceTypeFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState('');
  const [acting, setActing] = useState(false);

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const tabs = [
    { key: 'mine', label: 'My Bookings', icon: Calendar },
    { key: 'pending', label: 'Pending Approval', icon: Clock },
    { key: 'all', label: 'All', icon: CalendarDays },
  ];

  const resourceTypeOptions = [
    { value: 'meeting_room', label: 'Meeting Room' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'equipment', label: 'Equipment' },
  ];

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: activeTab === 'pending' ? 'pending' : undefined,
        resourceType: resourceTypeFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      };

      let res;
      if (activeTab === 'mine') {
        res = await bookingService.getMyBookings(params);
      } else {
        res = await bookingService.getAll(params);
      }

      setBookings(res.data?.bookings || res.data || res.bookings || []);
      setTotalItems(res.data?.total || res.total || res.data?.pagination?.total || 0);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, activeTab, resourceTypeFilter, dateRange]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const handleAction = async () => {
    if (!actionTarget || !actionType) return;
    setActing(true);
    try {
      if (actionType === 'approve') {
        await bookingService.approve(actionTarget.id);
        toast.success('Booking approved');
      } else if (actionType === 'reject') {
        await bookingService.reject(actionTarget.id);
        toast.success('Booking rejected');
      } else if (actionType === 'cancel') {
        await bookingService.cancel(actionTarget.id);
        toast.success('Booking cancelled');
      }
      setActionTarget(null);
      setActionType('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const getStatusLabel = (type) => {
    switch (type) {
      case 'approve': return 'Approve Booking';
      case 'reject': return 'Reject Booking';
      case 'cancel': return 'Cancel Booking';
      default: return 'Confirm Action';
    }
  };

  const getStatusMessage = (type) => {
    switch (type) {
      case 'approve': return 'Approve this booking request?';
      case 'reject': return 'Reject this booking request?';
      case 'cancel': return 'Cancel this booking? This cannot be undone.';
      default: return 'Are you sure?';
    }
  };

  const columns = [
    {
      key: 'resource',
      label: 'Resource',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {row.resourceName || row.asset?.name || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {row.resourceType || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.user
            ? `${row.user.firstName || ''} ${row.user.lastName || ''}`
            : row.user?.email || 'N/A'}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Start Time',
      sortable: true,
      render: (val) => formatDateTime(val),
    },
    {
      key: 'endDate',
      label: 'End Time',
      sortable: true,
      render: (val) => formatDateTime(val),
    },
    {
      key: 'purpose',
      label: 'Purpose',
      render: (val) => (
        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px] block">
          {val || 'N/A'}
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
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bookings/${row.id}`);
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
          {row.userId === user?.id && row.status !== 'cancelled' && row.status !== 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActionTarget(row);
                setActionType('cancel');
              }}
              className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Manage resource bookings"
        icon={Calendar}
        actionLabel="New Booking"
        onAction={() => navigate('/bookings/new')}
      >
        <button
          onClick={() => navigate('/bookings/calendar')}
          className="btn btn-secondary"
        >
          <CalendarDays className="h-4 w-4" /> Calendar View
        </button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search bookings..."
          className="w-full sm:w-72"
        />
        <Select
          options={resourceTypeOptions}
          value={resourceTypeFilter}
          onChange={(val) => {
            setResourceTypeFilter(val);
            setPage(1);
          }}
          placeholder="All Types"
          className="w-full sm:w-40"
        />
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={(range) => {
            setDateRange(range);
            setPage(1);
          }}
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
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings found"
            description="Create a booking to reserve a resource"
            actionLabel="New Booking"
            onAction={() => navigate('/bookings/new')}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={bookings}
              onRowClick={(row) => navigate(`/bookings/${row.id}`)}
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
        title={getStatusLabel(actionType)}
        message={`${getStatusMessage(actionType)} Resource: "${actionTarget?.resourceName || actionTarget?.asset?.name || ''}"`}
        confirmLabel={acting ? 'Processing...' : actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Cancel Booking'}
        onConfirm={handleAction}
        onCancel={() => {
          setActionTarget(null);
          setActionType('');
        }}
        variant={actionType === 'approve' ? 'info' : actionType === 'cancel' ? 'warning' : 'danger'}
      />
    </div>
  );
}
