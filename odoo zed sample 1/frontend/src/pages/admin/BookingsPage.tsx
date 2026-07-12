import React, { useState, useEffect } from 'react';
import { CalendarClock, Plus, X } from 'lucide-react';
import api from '../../services/api';
import { Booking, Asset } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookableAssets, setBookableAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ resourceId: '', startTime: '', endTime: '' });

  const fetchBookings = (page = 1) => {
    setLoading(true);
    api.get('/bookings', { params: { page, limit: 10, status: statusFilter } })
      .then(res => { if (res.data.success) { setBookings(res.data.data); setPagination(res.data.pagination); } })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/assets?sharedBookable=true&status=AVAILABLE&limit=100').then(r => {
      if (r.data.success) setBookableAssets(r.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/bookings', formData);
      toast.success('Booking created');
      setShowModal(false);
      fetchBookings(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success('Booking updated');
      fetchBookings(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings(pagination.page);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage resource bookings</p>
        </div>
        <button onClick={() => { setFormData({ resourceId: '', startTime: '', endTime: '' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
          <Plus size={18} /><span>New Booking</span>
        </button>
      </div>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-auto">
        <option value="">All Status</option>
        {['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="table-header">Resource</th>
                <th className="table-header">Employee</th>
                <th className="table-header">Start</th>
                <th className="table-header">End</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="p-4"><TableSkeleton /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6}><EmptyState title="No bookings" /></td></tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="table-cell"><span className="font-medium">{b.asset?.assetTag}</span><p className="text-xs text-gray-500">{b.asset?.assetName}</p></td>
                    <td className="table-cell text-sm">{b.employee?.name}</td>
                    <td className="table-cell text-sm">{new Date(b.startTime).toLocaleString()}</td>
                    <td className="table-cell text-sm">{new Date(b.endTime).toLocaleString()}</td>
                    <td className="table-cell"><StatusBadge status={b.status} /></td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end space-x-2">
                        {b.status === 'PENDING' && (
                          <button onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')} className="btn-success text-xs py-1 px-2">Confirm</button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button onClick={() => handleStatusUpdate(b.id, 'ACTIVE')} className="btn-primary text-xs py-1 px-2">Start</button>
                        )}
                        {b.status === 'ACTIVE' && (
                          <button onClick={() => handleStatusUpdate(b.id, 'COMPLETED')} className="btn-success text-xs py-1 px-2">Complete</button>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(b.status) && (
                          <button onClick={() => handleCancel(b.id)} className="btn-danger text-xs py-1 px-2">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchBookings} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Booking">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource *</label>
            <select value={formData.resourceId} onChange={(e) => setFormData(p => ({ ...p, resourceId: e.target.value }))} className="select-field" required>
              <option value="">Select resource</option>
              {bookableAssets.map(a => <option key={a.id} value={a.id}>{a.assetTag} - {a.assetName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time *</label>
            <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time *</label>
            <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))} className="input-field" required />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Booking</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
