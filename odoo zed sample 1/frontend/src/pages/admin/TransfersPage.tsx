import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Check, X, Plus } from 'lucide-react';
import api from '../../services/api';
import { TransferRequest, Asset, User } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function TransfersPage() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ assetId: '', currentHolderId: '', newHolderId: '', reason: '' });

  const canApprove = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER' || user?.role === 'DEPARTMENT_HEAD';

  const fetchTransfers = (page = 1) => {
    setLoading(true);
    api.get('/transfers', { params: { page, limit: 10, status: statusFilter } })
      .then(res => { if (res.data.success) { setTransfers(res.data.data); setPagination(res.data.pagination); } })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/assets?limit=100').then(r => { if (r.data.success) setAssets(r.data.data); }).catch(() => {});
    api.get('/employees?limit=100').then(r => { if (r.data.success) setEmployees(r.data.data); }).catch(() => {});
  }, []);

  useEffect(() => { fetchTransfers(); }, [statusFilter]);

  const handleApprove = async (id: string, status: string) => {
    try {
      await api.put(`/transfers/${id}/approve`, { approvalStatus: status });
      toast.success(`Transfer ${status.toLowerCase()}`);
      fetchTransfers(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transfers', formData);
      toast.success('Transfer request created');
      setShowModal(false);
      fetchTransfers(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Requests</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage asset transfer requests</p>
        </div>
        <button onClick={() => { setFormData({ assetId: '', currentHolderId: '', newHolderId: '', reason: '' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
          <Plus size={18} /><span>New Request</span>
        </button>
      </div>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-auto">
        <option value="">All Status</option>
        {['PENDING', 'APPROVED', 'REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="table-header">Asset</th>
                <th className="table-header">Requester</th>
                <th className="table-header">From</th>
                <th className="table-header">To</th>
                <th className="table-header">Reason</th>
                <th className="table-header">Status</th>
                {canApprove && <th className="table-header text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="p-4"><TableSkeleton /></td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No transfer requests" /></td></tr>
              ) : (
                transfers.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="table-cell"><span className="font-medium">{t.asset?.assetTag}</span><p className="text-xs text-gray-500">{t.asset?.assetName}</p></td>
                    <td className="table-cell text-sm">{t.requester?.name}</td>
                    <td className="table-cell text-sm">{t.currentHolder?.name}</td>
                    <td className="table-cell text-sm">{t.newHolder?.name}</td>
                    <td className="table-cell text-sm text-gray-500 max-w-[200px] truncate">{t.reason}</td>
                    <td className="table-cell"><StatusBadge status={t.approvalStatus} /></td>
                    {canApprove && (
                      <td className="table-cell">
                        {t.approvalStatus === 'PENDING' && (
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleApprove(t.id, 'APPROVED')} className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Approve"><Check size={16} className="text-emerald-600" /></button>
                            <button onClick={() => handleApprove(t.id, 'REJECTED')} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject"><X size={16} className="text-red-600" /></button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchTransfers} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Transfer Request">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset *</label>
            <select value={formData.assetId} onChange={(e) => setFormData(p => ({ ...p, assetId: e.target.value }))} className="select-field" required>
              <option value="">Select asset</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.assetTag} - {a.assetName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Holder *</label>
            <select value={formData.currentHolderId} onChange={(e) => setFormData(p => ({ ...p, currentHolderId: e.target.value }))} className="select-field" required>
              <option value="">Select</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Holder *</label>
            <select value={formData.newHolderId} onChange={(e) => setFormData(p => ({ ...p, newHolderId: e.target.value }))} className="select-field" required>
              <option value="">Select</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason *</label>
            <textarea value={formData.reason} onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))} className="input-field" rows={3} required />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
