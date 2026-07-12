import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Users,
  Eye,
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
import departmentService from '@/services/departmentService';
import employeeService from '@/services/employeeService';
import { departmentSchema } from '@/utils/validators';
import { usePagination } from '@/hooks/usePagination';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

export default function DepartmentListPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [employees, setEmployees] = useState([]);
  const { page, limit, totalPages, totalItems, setLimit, goToPage, reset } = usePagination({
    initialLimit: 10,
  });

  const confirm = useConfirmDialog();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      managerId: '',
      parentId: '',
    },
  });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, search };
      const response = await departmentService.getAll(params);
      setDepartments(response.data?.departments || response.data || []);
      if (response.data?.totalPages) {
        goToPage(response.data.currentPage || 1);
      }
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, goToPage]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeeService.getAll({ limit: 200 });
      setEmployees(response.data?.employees || response.data || []);
    } catch {
      setEmployees([]);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (val) => {
    setSearch(val);
    reset();
  };

  const openCreateModal = () => {
    setEditingDept(null);
    resetForm({ name: '', code: '', description: '', managerId: '', parentId: '' });
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    resetForm({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      managerId: dept.managerId || '',
      parentId: dept.parentId || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDept(null);
    resetForm();
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        managerId: data.managerId || undefined,
        parentId: data.parentId || undefined,
      };
      if (editingDept) {
        await departmentService.update(editingDept.id, payload);
        toast.success('Department updated successfully');
      } else {
        await departmentService.create(payload);
        toast.success('Department created successfully');
      }
      closeModal();
      fetchDepartments();
    } catch (err) {
      toast.error(err?.message || 'Operation failed');
    }
  };

  const handleDelete = async (dept) => {
    const confirmed = await confirm.openDialog({
      title: 'Delete Department',
      message: `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`,
    });
    if (!confirmed) return;
    try {
      await departmentService.remove(dept.id);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete department');
    }
  };

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName}`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Departments"
        subtitle="Manage your organization's departments"
        icon={Building2}
        actionLabel="Add Department"
        onAction={openCreateModal}
      />

      <SearchInput
        value={search}
        onChange={handleSearch}
        placeholder="Search departments..."
        className="max-w-sm"
      />

      {loading ? (
        <LoadingSpinner centered size="lg" />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description={search ? 'Try adjusting your search' : 'Create your first department to get started'}
          actionLabel={!search ? 'Add Department' : undefined}
          onAction={!search ? openCreateModal : undefined}
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="table-header border-b border-gray-200 dark:border-gray-700">
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {departments.map((dept) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => navigate(`/departments/${dept.id}`)}
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary-100 dark:bg-primary-900/30 p-2">
                            <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {dept.name}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{dept.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                          {dept.description || '-'}
                        </p>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {dept.managerName || '-'}
                        </p>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {dept.employeeCount ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/departments/${dept.id}`)}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(dept)}
                            className="p-2 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept)}
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
        title={editingDept ? 'Edit Department' : 'Create Department'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Department name</label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              className={`input ${errors.name ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Department code</label>
            <input
              type="text"
              placeholder="e.g. ENG"
              className={`input ${errors.code ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('code')}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="label">Description <span className="text-gray-400">(optional)</span></label>
            <textarea
              rows={3}
              placeholder="Brief description of the department"
              className={`input resize-none ${errors.description ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="label">Manager <span className="text-gray-400">(optional)</span></label>
            <select
              className={`input ${errors.managerId ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('managerId')}
            >
              <option value="">Select manager</option>
              {employeeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.managerId && (
              <p className="text-xs text-red-500 mt-1">{errors.managerId.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : editingDept ? 'Update' : 'Create'}
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
