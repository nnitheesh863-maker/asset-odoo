import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, QrCode, Search, Filter, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { Asset, AssetCategory, Department } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function AssetsPage() {
  const [searchParams] = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    assetName: '', serialNumber: '', categoryId: '', acquisitionDate: '', acquisitionCost: '',
    warranty: '', location: '', condition: 'NEW', sharedBookable: false, departmentId: '',
  });
  const [allocData, setAllocData] = useState({ employeeId: '', departmentId: '', expectedReturnDate: '', notes: '' });

  const fetchAssets = (page = 1) => {
    setLoading(true);
    api.get('/assets', { params: { page, limit: 10, search, status: statusFilter, categoryId: categoryFilter } })
      .then(res => { if (res.data.success) { setAssets(res.data.data); setPagination(res.data.pagination); } })
      .catch(() => toast.error('Failed to load assets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      api.get('/categories?limit=50'),
      api.get('/departments?limit=50'),
      api.get('/employees?limit=100'),
    ]).then(([catRes, deptRes, empRes]) => {
      if (catRes.data.success) setCategories(catRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchAssets(); }, [search, statusFilter, categoryFilter]);

  const openCreate = () => {
    setFormData({ assetName: '', serialNumber: '', categoryId: '', acquisitionDate: '', acquisitionCost: '', warranty: '', location: '', condition: 'NEW', sharedBookable: false, departmentId: '' });
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assets', formData);
      toast.success('Asset created');
      setShowModal(false);
      fetchAssets(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await api.post('/assets/allocate', { assetId: selectedAsset.id, ...allocData });
      toast.success('Asset allocated');
      setShowAllocModal(false);
      fetchAssets(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReturn = async (allocationId: string) => {
    try {
      await api.put(`/assets/return/${allocationId}`);
      toast.success('Asset returned');
      fetchAssets(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/assets/${deleteTarget.id}`);
      toast.success('Asset deleted');
      setDeleteTarget(null);
      fetchAssets(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const viewAsset = async (asset: Asset) => {
    try {
      const res = await api.get(`/assets/${asset.id}`);
      if (res.data.success) { setSelectedAsset(res.data.data); setShowDetailModal(true); }
    } catch { toast.error('Failed to load asset details'); }
  };

  const conditionColors: Record<string, string> = { NEW: 'badge-green', GOOD: 'badge-blue', FAIR: 'badge-yellow', POOR: 'badge-red', DAMAGED: 'badge-red' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all organizational assets</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center space-x-2"><Plus size={18} /><span>Register Asset</span></button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by tag, name, serial number..." className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-auto">
          <option value="">All Status</option>
          {['AVAILABLE','ALLOCATED','RESERVED','UNDER_MAINTENANCE','LOST','RETIRED','DISPOSED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-field w-auto">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="table-header">Asset</th>
                <th className="table-header">Tag</th>
                <th className="table-header">Category</th>
                <th className="table-header">Location</th>
                <th className="table-header">Condition</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="p-4"><TableSkeleton rows={5} cols={6} /></td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No assets found" description="Register your first asset" /></td></tr>
              ) : (
                assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-lg">
                          {asset.sharedBookable ? '📅' : '📦'}
                        </div>
                        <div>
                          <p className="font-medium">{asset.assetName}</p>
                          <p className="text-xs text-gray-500">SN: {asset.serialNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><code className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-lg">{asset.assetTag}</code></td>
                    <td className="table-cell text-sm text-gray-500">{asset.category?.name || '—'}</td>
                    <td className="table-cell text-sm text-gray-500">{asset.location}</td>
                    <td className="table-cell"><span className={`badge ${conditionColors[asset.condition] || 'badge-gray'}`}>{asset.condition}</span></td>
                    <td className="table-cell"><StatusBadge status={asset.status} /></td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => viewAsset(asset)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" title="View"><Eye size={16} className="text-gray-500" /></button>
                        {asset.status === 'AVAILABLE' && <button onClick={() => { setSelectedAsset(asset); setShowAllocModal(true); setAllocData({ employeeId: '', departmentId: '', expectedReturnDate: '', notes: '' }); }} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20" title="Allocate"><ArrowUpRight size={16} className="text-primary-500" /></button>}
                        <button onClick={() => setDeleteTarget(asset)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete"><Trash2 size={16} className="text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchAssets} />
      </div>

      {/* Create Asset Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Asset" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Name *</label>
              <input type="text" value={formData.assetName} onChange={(e) => setFormData(p => ({ ...p, assetName: e.target.value }))} className="input-field" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number *</label>
              <input type="text" value={formData.serialNumber} onChange={(e) => setFormData(p => ({ ...p, serialNumber: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select value={formData.categoryId} onChange={(e) => setFormData(p => ({ ...p, categoryId: e.target.value }))} className="select-field" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acquisition Date *</label>
              <input type="date" value={formData.acquisitionDate} onChange={(e) => setFormData(p => ({ ...p, acquisitionDate: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost *</label>
              <input type="number" step="0.01" value={formData.acquisitionCost} onChange={(e) => setFormData(p => ({ ...p, acquisitionCost: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
              <select value={formData.condition} onChange={(e) => setFormData(p => ({ ...p, condition: e.target.value }))} className="select-field">
                {['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select value={formData.departmentId} onChange={(e) => setFormData(p => ({ ...p, departmentId: e.target.value }))} className="select-field">
                <option value="">Select</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty</label>
              <input type="text" value={formData.warranty} onChange={(e) => setFormData(p => ({ ...p, warranty: e.target.value }))} className="input-field" placeholder="e.g., 3 years" />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input type="checkbox" checked={formData.sharedBookable} onChange={(e) => setFormData(p => ({ ...p, sharedBookable: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
              <label className="text-sm text-gray-700 dark:text-gray-300">Shared/Bookable</label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Asset</button>
          </div>
        </form>
      </Modal>

      {/* Allocate Modal */}
      <Modal isOpen={showAllocModal} onClose={() => setShowAllocModal(false)} title={`Allocate ${selectedAsset?.assetTag}`}>
        <form onSubmit={handleAllocate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
            <select value={allocData.employeeId} onChange={(e) => setAllocData(p => ({ ...p, employeeId: e.target.value }))} className="select-field" required>
              <option value="">Select employee</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.employeeId})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <select value={allocData.departmentId} onChange={(e) => setAllocData(p => ({ ...p, departmentId: e.target.value }))} className="select-field">
              <option value="">Select</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Return Date</label>
            <input type="date" value={allocData.expectedReturnDate} onChange={(e) => setAllocData(p => ({ ...p, expectedReturnDate: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={allocData.notes} onChange={(e) => setAllocData(p => ({ ...p, notes: e.target.value }))} className="input-field" rows={2} />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowAllocModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Allocate</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Asset Details" size="lg">
        {selectedAsset && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <code className="text-lg font-bold text-primary-600">{selectedAsset.assetTag}</code>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{selectedAsset.assetName}</h3>
                  </div>
                  <StatusBadge status={selectedAsset.status} />
                </div>
              </div>
              <InfoItem label="Serial Number" value={selectedAsset.serialNumber} />
              <InfoItem label="Category" value={selectedAsset.category?.name || '—'} />
              <InfoItem label="Location" value={selectedAsset.location} />
              <InfoItem label="Condition" value={selectedAsset.condition} />
              <InfoItem label="Acquisition Date" value={new Date(selectedAsset.acquisitionDate).toLocaleDateString()} />
              <InfoItem label="Cost" value={`$${selectedAsset.acquisitionCost.toLocaleString()}`} />
              <InfoItem label="Warranty" value={selectedAsset.warranty || '—'} />
              <InfoItem label="Bookable" value={selectedAsset.sharedBookable ? 'Yes' : 'No'} />
            </div>

            {selectedAsset.allocations && selectedAsset.allocations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Allocation History</h4>
                <div className="space-y-2">
                  {selectedAsset.allocations.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium">{a.employee?.name}</p>
                        <p className="text-xs text-gray-500">{new Date(a.allocatedDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={a.status} />
                        {a.status === 'ACTIVE' && (
                          <button onClick={() => handleReturn(a.id)} className="btn-secondary text-xs py-1 px-2">Return</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Asset" message={`Delete ${deleteTarget?.assetTag} (${deleteTarget?.assetName})?`} confirmText="Delete" />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
