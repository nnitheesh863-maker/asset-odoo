import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RefreshCw,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import allocationService from '@/services/allocationService';
import employeeService from '@/services/employeeService';
import departmentService from '@/services/departmentService';
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
import { formatDate } from '@/utils/formatters';

export default function AllocationListPage() {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [employeeFilter, setEmployeeFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returning, setReturning] = useState(false);

  const tabs = [
    { key: 'active', label: 'Active', icon: CheckCircle },
    { key: 'returned', label: 'Returned', icon: RotateCcw },
    { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
    { key: 'all', label: 'All', icon: RefreshCw },
  ];

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: activeTab === 'all' ? undefined : activeTab,
        employeeId: employeeFilter || undefined,
        departmentId: departmentFilter || undefined,
      };
      const res = await allocationService.getAll(params);
      setAllocations(res.data?.allocations || res.data || res.allocations || []);
      setTotalItems(res.data?.total || res.total || res.data?.pagination?.total || 0);
    } catch {
      toast.error('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, activeTab, employeeFilter, departmentFilter]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          employeeService.getAll(),
          departmentService.getAll(),
        ]);
        setEmployees(empRes.data?.employees || empRes.data || empRes.employees || []);
        setDepartments(deptRes.data?.departments || deptRes.data || deptRes.departments || []);
      } catch {}
    };
    loadFilters();
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const handleReturn = async () => {
    if (!returnTarget) return;
    setReturning(true);
    try {
      await allocationService.returnAsset(returnTarget.id);
      toast.success('Asset returned successfully');
      setReturnTarget(null);
      fetchAllocations();
    } catch {
      toast.error('Failed to return asset');
    } finally {
      setReturning(false);
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
      key: 'employee',
      label: 'Employee',
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.employee
            ? `${row.employee.firstName || ''} ${row.employee.lastName || ''}`
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'allocatedDate',
      label: 'Assigned Date',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: 'expectedReturnDate',
      label: 'Expected Return',
      sortable: true,
      render: (val) => (val ? formatDate(val) : 'N/A'),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'assignedBy',
      label: 'Assigned By',
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.assignedBy
            ? `${row.assignedBy.firstName || ''} ${row.assignedBy.lastName || ''}`
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/allocations/${row.id}`);
            }}
            className="btn btn-ghost btn-sm"
          >
            View
          </button>
          {row.status === 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setReturnTarget(row);
              }}
              className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
            >
              Return
            </button>
          )}
        </div>
      ),
    },
  ];

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName || ''} ${e.lastName || ''}`,
  }));

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  return (
    <div>
      <PageHeader
        title="Allocations"
        subtitle="Manage asset allocations"
        icon={RefreshCw}
        actionLabel="New Allocation"
        onAction={() => navigate('/allocations/new')}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search allocations..."
          className="w-full sm:w-72"
        />
        <Select
          options={employeeOptions}
          value={employeeFilter}
          onChange={(val) => {
            setEmployeeFilter(val);
            setPage(1);
          }}
          placeholder="All Employees"
          className="w-full sm:w-48"
        />
        <Select
          options={departmentOptions}
          value={departmentFilter}
          onChange={(val) => {
            setDepartmentFilter(val);
            setPage(1);
          }}
          placeholder="All Departments"
          className="w-full sm:w-48"
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
        ) : allocations.length === 0 ? (
          <EmptyState
            icon={RefreshCw}
            title="No allocations found"
            description="Create your first allocation to get started"
            actionLabel="New Allocation"
            onAction={() => navigate('/allocations/new')}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={allocations}
              onRowClick={(row) => navigate(`/allocations/${row.id}`)}
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
        isOpen={!!returnTarget}
        title="Return Asset"
        message={`Mark the allocation for "${returnTarget?.asset?.name || ''}" as returned?`}
        confirmLabel={returning ? 'Returning...' : 'Return Asset'}
        onConfirm={handleReturn}
        onCancel={() => setReturnTarget(null)}
        variant="info"
      />
    </div>
  );
}
