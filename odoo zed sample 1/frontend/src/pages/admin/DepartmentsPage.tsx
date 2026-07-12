import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Users, Package } from 'lucide-react';
import api from '../../services/api';
import { Department } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', status: 'ACTIVE' });

  const fetchDepartments = (page = 1, searchQuery = '') => {
    setLoading(true);
    api.get('/departments', { params: { page, limit: 10, search: searchQuery } })
      .then(res => {
        if (res.data.success) {
          setDepartments(res.data.data);
          setPagination(res.data.pagination);
        }
      })
      .catch(() => toast.error('Failed to load departments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDepartments(1, search);
  };

  const openCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', status: 'ACTIVE' });
    setShowModal(true);
  };

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description || '', status: dept.status });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
        toast.success('Department updated');
      } else {
        await api.post('/departments', formData);
        toast.success('Department created');
      }
      setShowModal(false);
      fetchDepartments(pagination.page, search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      toast.success('Department deleted');
      setDeleteTarget(null);
      fetchDepartments(pagination.page, search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage organizational departments</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." className="input-field flex-1" />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="table-header">Department</th>
                <th className="table-header">Head</th>
                <th className="table-header">Employees</th>
                <th className="table-header">Assets</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="p-4"><TableSkeleton rows={5} cols={5} /></td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan={6}><EmptyState title="No departments found" description="Create your first department" /></td></tr>
              ) : (
                departments.map(dept => (
                  <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                          <Building2 size={18} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-xs text-gray-500">{dept.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">{dept.departmentHead?.name || 'Not assigned'}</td>
                    <td className="table-cell"><div className="flex items-center space-x-1"><Users size={14} /><span>{dept._count?.employees || 0}</span></div></td>
                    <td className="table-cell"><div className="flex items-center space-x-1"><Package size={14} /><span>{dept._count?.assets || 0}</span></div></td>
                    <td className="table-cell"><StatusBadge status={dept.status} /></td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openEdit(dept)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"><Edit2 size={16} className="text-gray-500" /></button>
                        <button onClick={() => setDeleteTarget(dept)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={16} className="text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={(p) => fetchDepartments(p, search)} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingDept ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="select-field">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingDept ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Department" message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`} confirmText="Delete" />
    </div>
  );
}
