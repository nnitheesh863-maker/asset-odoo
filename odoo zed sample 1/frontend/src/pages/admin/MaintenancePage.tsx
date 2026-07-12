import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Check, X, ArrowUp } from 'lucide-react';
import api from '../../services/api';
import { MaintenanceRequest, Asset } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function MaintenancePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ assetId: '', issue: '', priority: 'MEDIUM' });

  const canApprove = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER' || user?.role === 'DEPARTMENT_HEAD';

  const fetchRequests = (page = 1) => {
    setLoading(true);
    api.get('/maintenance', { params: { page, limit: 10, approvalStatus: statusFilter } })
      .then(res => { if (res.data.success) { setRequests(res.data.data); setPagination(res.data.pagination); } })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/assets?limit=100').then(r => { if (r.data.success) setAssets(r.data.data); }).catch(() => {});
  }, []);

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', formData);
      toast.success('Maintenance request submitted');
      setShowModal(false);
      fetchRequests(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleApprove = async (id: string, status: string) => {
    try {
      await api.put(`/maintenance/${id}/approve`, { approvalStatus: status });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchRequests(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleProgress = async (id: string, progressStatus: string) => {
    try {
      await api.put(`/maintenance/${id}/progress`, { progressStatus });
      toast.success('Progress updated');
      fetchRequests(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Requests</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage maintenance requests</p>
        </div>
        <button onClick={() => { setFormData({ assetId: '', issue: '', priority: 'MEDIUM' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
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
                <th className="table-header">Issue</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Requester</th>
                <th className="table-header">Approval</th>
                <th className="table-header">Progress</th>
                {canApprove && <th className="table-header text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="p-4"><TableSkeleton /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No maintenance requests" /></td></tr>
              ) : (
                requests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="table-cell">
                      <span className="font-medium">{r.asset?.assetTag}</span>
                      <p className="text-xs text-gray-500">{r.asset?.assetName}</p>
                    </td>
                    <td className="table-cell text-sm text-gray-500 max-w-[200px] truncate">{r.issue}</td>
                    <td className="table-cell"><PriorityBadge priority={r.priority} /></td>
                    <td className="table-cell text-sm">{r.employee?.name}</td>
                    <td className="table-cell"><StatusBadge status={r.approvalStatus} /></td>
                    <td className="table-cell"><StatusBadge status={r.progressStatus} /></td>
                    {canApprove && (
                      <td className="table-cell">
                        <div className="flex items-center justify-end space-x-2">
                          {r.approvalStatus === 'PENDING' && (
                            <>
                              <button onClick={() => handleApprove(r.id, 'APPROVED')} className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Approve"><Check size={16} className="text-emerald-600" /></button>
                              <button onClick={() => handleApprove(r.id, 'REJECTED')} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject"><X size={16} className="text-red-600" /></button>
                            </>
                          )}
                          {r.approvalStatus === 'APPROVED' && r.progressStatus !== 'COMPLETED' && (
                            <button onClick={() => handleProgress(r.id, 'COMPLETED')} className="btn-success text-xs py-1 px-2">Complete</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchRequests} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Maintenance Request">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset *</label>
            <select value={formData.assetId} onChange={(e) => setFormData(p => ({ ...p, assetId: e.target.value }))} className="select-field" required>
              <option value="">Select asset</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.assetTag} - {a.assetName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Description *</label>
            <textarea value={formData.issue} onChange={(e) => setFormData(p => ({ ...p, issue: e.target.value }))} className="input-field" rows={4} placeholder="Describe the issue..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData(p => ({ ...p, priority: e.target.value }))} className="select-field">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
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
