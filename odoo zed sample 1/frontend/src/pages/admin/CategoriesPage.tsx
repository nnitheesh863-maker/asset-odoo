import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import api from '../../services/api';
import { AssetCategory } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AssetCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssetCategory | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = (page = 1) => {
    setLoading(true);
    api.get('/categories', { params: { page, limit: 10 } })
      .then(res => { if (res.data.success) { setCategories(res.data.data); setPagination(res.data.pagination); } })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchCategories(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Categories</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage asset classification categories</p>
        </div>
        <button onClick={() => { setEditing(null); setFormData({ name: '', description: '' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
          <Plus size={18} /><span>Add Category</span>
        </button>
      </div>

      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="table-header">Category</th>
                <th className="table-header">Description</th>
                <th className="table-header">Assets</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="p-4"><TableSkeleton /></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4}><EmptyState title="No categories" /></td></tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl"><FolderTree size={18} className="text-purple-600" /></div>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-gray-500">{cat.description || '—'}</td>
                    <td className="table-cell text-sm">{cat._count?.assets || 0}</td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => { setEditing(cat); setFormData({ name: cat.name, description: cat.description || '' }); setShowModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit2 size={16} className="text-gray-500" /></button>
                        <button onClick={() => setDeleteTarget(cat)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={16} className="text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchCategories} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Category" message={`Delete "${deleteTarget?.name}"?`} confirmText="Delete" />
    </div>
  );
}
