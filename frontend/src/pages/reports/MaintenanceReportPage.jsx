import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  DollarSign,
  FileText,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '@/services/reportService';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import DateRangePicker from '@/components/common/DateRangePicker';
import Select from '@/components/common/Select';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { PieChart, LineChart, BarChart } from '@/components/ui/Charts';
import { formatCurrency, formatDate, getPriorityColor } from '@/utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'requested', label: 'Requested' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function formatPriorityLabel(p) {
  if (!p) return '';
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export default function MaintenanceReportPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [items, setItems] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await reportService.getMaintenanceReport(params);
      const data = res?.data || res;
      setReport(data);
      setItems(data?.items || data?.requests || []);
    } catch {
      toast.error('Failed to load maintenance report');
    } finally {
      setLoading(false);
    }
  }, [dateRange, priorityFilter, statusFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const blob = format === 'pdf'
        ? await reportService.exportPDF('maintenance', params)
        : await reportService.exportExcel('maintenance', params);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maintenance-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(null);
    }
  };

  const statusData = report?.statusDistribution || report?.byStatus || [
    { name: 'Requested', value: items.filter((i) => i.status === 'requested').length || 0 },
    { name: 'In Progress', value: items.filter((i) => i.status === 'in_progress').length || 0 },
    { name: 'Completed', value: items.filter((i) => i.status === 'completed').length || 0 },
  ];

  const costTrend = report?.costTrend || report?.costOverTime || [];

  const priorityData = report?.priorityDistribution || report?.byPriority || (() => {
    const map = {};
    items.forEach((i) => {
      const p = formatPriorityLabel(i.priority || 'medium');
      map[p] = (map[p] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Maintenance Report" subtitle="Maintenance history, costs, and analysis" icon={Wrench}>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('pdf')} disabled={!!exporting} className="btn btn-secondary btn-sm flex items-center gap-1">
            <FileText className="h-4 w-4" /> PDF
          </button>
          <button onClick={() => handleExport('excel')} disabled={!!exporting} className="btn btn-secondary btn-sm flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </button>
          <button onClick={() => handleExport('csv')} disabled={!!exporting} className="btn btn-secondary btn-sm flex items-center gap-1">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <DateRangePicker label="Date Range" startDate={dateRange.startDate} endDate={dateRange.endDate} onChange={setDateRange} />
        <Select options={PRIORITY_OPTIONS} value={priorityFilter} onChange={setPriorityFilter} label="Priority" />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} label="Status" />
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Requests" value={report?.totalRequests || items.length} icon={Wrench} color="blue" />
            <StatsCard title="Completed" value={report?.completed || items.filter((i) => i.status === 'completed').length} icon={Wrench} color="green" />
            <StatsCard title="In Progress" value={report?.inProgress || items.filter((i) => i.status === 'in_progress').length} icon={Wrench} color="amber" />
            <StatsCard
              title="Total Cost"
              value={formatCurrency(report?.totalCost || items.reduce((s, i) => s + (i.actualCost || i.cost || 0), 0))}
              icon={DollarSign}
              color="purple"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance by Status</h3>
              <PieChart data={statusData} />
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance by Priority</h3>
              <BarChart data={priorityData} xKey="name" yKey="value" color="#f59e0b" />
            </div>
          </div>

          {costTrend.length > 0 && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Trend</h3>
              <LineChart data={costTrend} xKey="name" yKey="value" color="#10b981" />
            </div>
          )}

          {/* Data Table */}
          <div className="card overflow-hidden overflow-x-auto">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance Details</h3>
            </div>
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Asset</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No maintenance records found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id || item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {item.asset?.name || item.assetName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.title || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                          {formatPriorityLabel(item.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.actualCost || item.cost || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} size="sm" /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
}
