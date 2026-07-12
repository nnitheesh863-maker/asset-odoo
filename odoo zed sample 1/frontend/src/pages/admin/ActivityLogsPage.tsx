import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import api from '../../services/api';
import { ActivityLog } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchLogs = (page = 1) => {
    setLoading(true);
    api.get('/activity-logs', { params: { page, limit: 20, module: moduleFilter } })
      .then(res => { if (res.data.success) { setLogs(res.data.data); setPagination(res.data.pagination); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [moduleFilter]);

  const actionColors: Record<string, string> = {
    CREATED: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    UPDATED: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    DELETED: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    APPROVED: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    REJECTED: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    ALLOCATED: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    RETURNED: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
    LOGIN: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-500 dark:text-gray-400">Complete audit trail of all system actions</p>
      </div>

      <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="select-field w-auto">
        <option value="">All Modules</option>
        {['AUTH', 'ASSET', 'DEPARTMENT', 'EMPLOYEE', 'TRANSFER_REQUEST', 'MAINTENANCE', 'BOOKING', 'AUDIT_CYCLE', 'ASSET_CATEGORY'].map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
      </select>

      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="table-header">User</th>
                <th className="table-header">Action</th>
                <th className="table-header">Module</th>
                <th className="table-header">Details</th>
                <th className="table-header">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="p-4"><TableSkeleton rows={8} cols={4} /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={Activity} title="No activity logs" /></td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold">
                          {log.user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{log.user?.name || 'System'}</p>
                          <p className="text-xs text-gray-500">{log.user?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${actionColors[log.action]?.split(' ')[1] || 'badge-gray'}`}>
                        <span className={actionColors[log.action]?.split(' ')[0] || ''}>{log.action}</span>
                      </span>
                    </td>
                    <td className="table-cell text-sm">{log.module.replace('_', ' ')}</td>
                    <td className="table-cell text-xs text-gray-500 max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                    <td className="table-cell text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchLogs} />
      </div>
    </div>
  );
}
