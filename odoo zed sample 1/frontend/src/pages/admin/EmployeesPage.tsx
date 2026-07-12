import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import { User, Department } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', departmentId: '', role: 'EMPLOYEE', status: 'ACTIVE',
  });

  const fetchEmployees = (page = 1) => {
    setLoading(true);
    api.get('/employees', { params: { page, limit: 10, search, role: roleFilter } })
      .then(res => {
        if (res.data.success) {
          setEmployees(res.data.data);
          setPagination(res.data.pagination);
        }
      })
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/departments?limit=50').then(res => {
      if (res.data.success) setDepartments(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchEmployees(); }, [search, roleFilter]);

  const openCreate = () => {
    setEditingEmp(null);
    setFormData({ name: '', email: '', password: '', phone: '', departmentId: '', role: 'EMPLOYEE', status: 'ACTIVE' });
    setShowModal(true);
  };

  const openEdit = (emp: User) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.name, email: emp.email, password: '', phone: emp.phone || '',
      departmentId: emp.departmentId || '', role: emp.role, status: emp.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        const { password, ...data } = formData;
        await api.put(`/employees/${editingEmp.id}`, data);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', formData);
        toast.success('Employee created');
      }
      setShowModal(false);
      fetchEmployees(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/employees/${deleteTarget.id}`);
      toast.success('Employee deactivated');
      setDeleteTarget(null);
      fetchEmployees(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'badge-red',
    ASSET_MANAGER: 'badge-blue',
    DEPARTMENT_HEAD: 'badge-purple',
    EMPLOYEE: 'badge-green',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage system users and their roles</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center space-x-2">
          <Plus size={18} /><span>Add Employee</span>
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, ID..." className="input-field flex-1 min-w-[200px]" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="select-field w-auto">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="ASSET_MANAGER">Asset Manager</option>
          <option value="DEPARTMENT_HEAD">Department Head</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
      </div>

      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="table-header">Employee</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Department</th>
                <th className="table-header">Role</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="p-4"><TableSkeleton rows={5} cols={5} /></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={6}><EmptyState title="No employees found" /></td></tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">{emp.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500"><Mail size={12} /><span>{emp.email}</span></div>
                        {emp.phone && <div className="flex items-center space-x-1 text-xs text-gray-500"><Phone size={12} /><span>{emp.phone}</span></div>}
                      </div>
                    </td>
                    <td className="table-cell text-sm text-gray-500">{emp.department?.name || '—'}</td>
                    <td className="table-cell"><span className={`badge ${roleColors[emp.role] || 'badge-gray'}`}>{emp.role.replace('_', ' ')}</span></td>
                    <td className="table-cell"><StatusBadge status={emp.status} /></td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openEdit(emp)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit2 size={16} className="text-gray-500" /></button>
                        <button onClick={() => setDeleteTarget(emp)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={16} className="text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchEmployees} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingEmp ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{editingEmp ? 'New Password' : 'Password *'}</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} className="input-field" {...(!editingEmp && { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
              <select value={formData.departmentId} onChange={(e) => setFormData(p => ({ ...p, departmentId: e.target.value }))} className="select-field">
                <option value="">Select</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
              <select value={formData.role} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))} className="select-field">
                <option value="EMPLOYEE">Employee</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="ASSET_MANAGER">Asset Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {editingEmp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="select-field">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingEmp ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Deactivate Employee" message={`Deactivate ${deleteTarget?.name}? They will no longer be able to access the system.`} confirmText="Deactivate" />
    </div>
  );
}
