import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  FileText,
  FileSpreadsheet,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '@/services/reportService';
import assetService from '@/services/assetService';
import departmentService from '@/services/departmentService';
import categoryService from '@/services/categoryService';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import DateRangePicker from '@/components/common/DateRangePicker';
import Select from '@/components/common/Select';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { PieChart, BarChart, AreaChart } from '@/components/ui/Charts';
import { formatCurrency, formatDate } from '@/utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'allocated', label: 'Allocated' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
  { value: 'lost', label: 'Lost' },
];

export default function AssetReportPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (departmentFilter) params.departmentId = departmentFilter;
      if (statusFilter) params.status = statusFilter;

      const [reportRes, assetsRes, deptsRes, catsRes] = await Promise.allSettled([
        reportService.getAssetReport(params),
        assetService.getAll({ ...params, limit: 200 }),
        departmentService.getAll({ limit: 200 }),
        categoryService.getAll({ limit: 200 }),
      ]);

      if (reportRes.status === 'fulfilled') {
        setReport(reportRes.value?.data || reportRes.value);
      }
      if (assetsRes.status === 'fulfilled') {
        const d = assetsRes.value?.data || assetsRes.value;
        setAssets(Array.isArray(d) ? d : d?.assets || []);
      }
      if (deptsRes.status === 'fulfilled') {
        const d = deptsRes.value?.data || deptsRes.value;
        setDepartments(Array.isArray(d) ? d : d?.departments || []);
      }
      if (catsRes.status === 'fulfilled') {
        const d = catsRes.value?.data || catsRes.value;
        setCategories(Array.isArray(d) ? d : d?.categories || []);
      }
    } catch {
      toast.error('Failed to load asset report');
    } finally {
      setLoading(false);
    }
  }, [dateRange, categoryFilter, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (statusFilter) params.status = statusFilter;

      const blob = format === 'pdf'
        ? await reportService.exportPDF('assets', params)
        : await reportService.exportExcel('assets', params);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
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
    { name: 'Available', value: assets.filter((a) => a.status === 'available').length || 0 },
    { name: 'Allocated', value: assets.filter((a) => a.status === 'allocated').length || 0 },
    { name: 'Maintenance', value: assets.filter((a) => a.status === 'maintenance').length || 0 },
    { name: 'Retired', value: assets.filter((a) => a.status === 'retired').length || 0 },
  ];

  const categoryData = report?.categoryDistribution || report?.byCategory || (() => {
    const map = {};
    assets.forEach((a) => {
      const cat = a.category?.name || a.categoryName || 'Uncategorized';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const growthData = report?.growthData || report?.growth || [];

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((d) => ({ value: d.id || d._id, label: d.name })),
  ];

  const catOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id || c._id, label: c.name })),
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Asset Report" subtitle="Detailed asset analysis and statistics" icon={BarChart3}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="btn btn-secondary btn-sm flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={!!exporting}
            className="btn btn-secondary btn-sm flex items-center gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="btn btn-secondary btn-sm flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DateRangePicker
          label="Date Range"
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
        <Select options={catOptions} value={categoryFilter} onChange={setCategoryFilter} label="Category" />
        <Select options={deptOptions} value={departmentFilter} onChange={setDepartmentFilter} label="Department" />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} label="Status" />
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Assets"
              value={report?.totalAssets || assets.length}
              icon={Package}
              color="blue"
            />
            <StatsCard
              title="Available"
              value={report?.availableAssets || statusData.find((s) => s.name === 'Available')?.value || 0}
              icon={Package}
              color="green"
            />
            <StatsCard
              title="Allocated"
              value={report?.allocatedAssets || statusData.find((s) => s.name === 'Allocated')?.value || 0}
              icon={Package}
              color="purple"
            />
            <StatsCard
              title="Total Value"
              value={formatCurrency(report?.totalValue || assets.reduce((sum, a) => sum + (a.currentValue || a.purchasePrice || 0), 0))}
              icon={Package}
              color="amber"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assets by Status</h3>
              <PieChart data={statusData} />
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assets by Category</h3>
              <BarChart data={categoryData} xKey="name" yKey="value" color="#8b5cf6" />
            </div>
          </div>

          {growthData.length > 0 && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Growth</h3>
              <AreaChart data={growthData} xKey="name" yKey="value" color="#3b82f6" />
            </div>
          )}

          {/* Data Table */}
          <div className="card overflow-hidden overflow-x-auto">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Details</h3>
            </div>
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Asset Tag</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No assets found matching the filters.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.id || asset._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {asset.assetTag || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{asset.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {asset.category?.name || asset.categoryName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {asset.department?.name || asset.departmentName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(asset.currentValue || asset.purchasePrice || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={asset.status} size="sm" />
                      </td>
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
