import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Avatar from '@/components/common/Avatar';
import employeeService from '@/services/employeeService';
import departmentService from '@/services/departmentService';
import { employeeSchema } from '@/utils/validators';
import { usePagination } from '@/hooks/usePagination';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ROLES } from '@/utils/constants';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ departmentId: '', role: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);

  const { page, limit, totalPages, totalItems, setLimit, goToPage, reset } = usePagination({
    initialLimit: 10,
  });
  const confirm = useConfirmDialog();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      departmentId: '',
      designation: '',
      dateOfJoining: '',
      status: 'active',
    },
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, search, ...filters };
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k];
      });
      const response = await employeeService.getAll(params);
      setEmployees(response.data?.employees || response.data || []);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filters, goToPage]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await departmentService.getAll({ limit: 200 });
      setDepartments(response.data?.departments || response.data || []);
    } catch {
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSearch = (val) => {
    setSearch(val);
    reset();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    reset();
  };

  const clearFilters = () => {
    setFilters({ departmentId: '', role: '', status: '' });
    reset();
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const openCreateModal = () => {
    setEditingEmp(null);
    resetForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      departmentId: '',
      designation: '',
      dateOfJoining: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    resetForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      employeeId: emp.employeeId || '',
      departmentId: emp.departmentId || '',
      designation: emp.designation || '',
      dateOfJoining: emp.dateOfJoining?.split('T')[0] || '',
      status: emp.status || 'active',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmp(null);
    resetForm();
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        departmentId: data.departmentId || undefined,
        dateOfJoining: data.dateOfJoining || undefined,
      };
      if (editingEmp) {
        await employeeService.update(editingEmp.id, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.create(payload);
        toast.success('Employee created successfully');
      }
      closeModal();
      fetchEmployees();
    } catch (err) {
      toast.error(err?.message || 'Operation failed');
    }
  };

  const handleDelete = async (emp) => {
    const confirmed = await confirm.openDialog({
      title: 'Delete Employee',
      message: `Are you sure you want to remove "${emp.firstName} ${emp.lastName}"? This action cannot be undone.`,
    });
    if (!confirmed) return;
    try {
      await employeeService.remove(emp.id);
      toast.success('Employee removed successfully');
      fetchEmployees();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove employee');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Employees"
        subtitle="Manage your organization's employees"
        icon={Users}
        actionLabel="Add Employee"
        onAction={openCreateModal}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search employees..."
          className="max-w-sm flex-1"
        />
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`btn btn-secondary btn-sm flex items-center gap-2 ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn btn-ghost btn-sm flex items-center gap-1 text-gray-500"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div>
            <label className="label">Department</label>
            <select
              className="input"
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </motion.div>
      )}

      {loading ? (
        <LoadingSpinner centered size="lg" />
      ) : employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={search || hasActiveFilters ? 'Try adjusting your search or filters' : 'Add your first employee to get started'}
          actionLabel={!search && !hasActiveFilters ? 'Add Employee' : undefined}
          onAction={!search && !hasActiveFilters ? openCreateModal : undefined}
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="table-header border-b border-gray-200 dark:border-gray-700">
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={`${emp.firstName} ${emp.lastName}`}
                            size="sm"
                            src={emp.avatar}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {emp.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{emp.email}</p>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {emp.departmentName || '-'}
                        </p>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {emp.role || emp.designation || '-'}
                        </p>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={emp.status || 'active'} size="sm" />
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={goToPage}
            onLimitChange={setLimit}
            limit={limit}
          />
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingEmp ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First name</label>
              <input
                type="text"
                placeholder="John"
                className={`input ${errors.firstName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Last name</label>
              <input
                type="text"
                placeholder="Doe"
                className={`input ${errors.lastName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                placeholder="john@company.com"
                className={`input ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="label">Phone <span className="text-gray-400">(optional)</span></label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className={`input ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Employee ID</label>
              <input
                type="text"
                placeholder="e.g. EMP001"
                className={`input ${errors.employeeId ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('employeeId')}
              />
              {errors.employeeId && (
                <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>
              )}
            </div>
            <div>
              <label className="label">Department</label>
              <select
                className={`input ${errors.departmentId ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('departmentId')}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="text-xs text-red-500 mt-1">{errors.departmentId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Designation <span className="text-gray-400">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                className={`input ${errors.designation ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('designation')}
              />
              {errors.designation && (
                <p className="text-xs text-red-500 mt-1">{errors.designation.message}</p>
              )}
            </div>
            <div>
              <label className="label">Date of joining <span className="text-gray-400">(optional)</span></label>
              <input
                type="date"
                className={`input ${errors.dateOfJoining ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('dateOfJoining')}
              />
              {errors.dateOfJoining && (
                <p className="text-xs text-red-500 mt-1">{errors.dateOfJoining.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : editingEmp ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
        variant="danger"
      />
    </motion.div>
  );
}
