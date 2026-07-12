import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '@/services/reportService';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import DateRangePicker from '@/components/common/DateRangePicker';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BarChart, LineChart } from '@/components/ui/Charts';
import { formatCurrency } from '@/utils/formatters';

export default function CostReportPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [exporting, setExporting] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await reportService.getCostReport(params);
      const data = res?.data || res;
      setReport(data);
    } catch {
      toast.error('Failed to load cost report');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

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
        ? await reportService.exportPDF('costs', params)
        : await reportService.exportExcel('costs', params);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cost-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(null);
    }
  };

  const categoryCostData = report?.costByCategory || report?.byCategory || [];
  const costOverTime = report?.costOverTime || report?.trend || [];

  const totalPurchaseCost = report?.totalPurchaseCost || 0;
  const totalMaintenanceCost = report?.totalMaintenanceCost || 0;
  const totalCost = totalPurchaseCost + totalMaintenanceCost;
  const roi = report?.roi || (totalPurchaseCost > 0 ? Math.round(((totalPurchaseCost - totalMaintenanceCost) / totalPurchaseCost) * 100) : 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Cost Report" subtitle="Cost analysis and ROI calculations" icon={DollarSign}>
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
      <div className="mb-6 max-w-xl">
        <DateRangePicker
          label="Date Range"
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Purchase Cost" value={formatCurrency(totalPurchaseCost)} icon={DollarSign} color="blue" />
            <StatsCard title="Total Maintenance Cost" value={formatCurrency(totalMaintenanceCost)} icon={DollarSign} color="amber" />
            <StatsCard title="Total Cost" value={formatCurrency(totalCost)} icon={DollarSign} color="red" />
            <StatsCard title="ROI" value={`${roi}%`} icon={TrendingUp} color="green" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {categoryCostData.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost by Category</h3>
                <BarChart data={categoryCostData} xKey="name" yKey="value" color="#ef4444" />
              </div>
            )}
            {costOverTime.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Over Time</h3>
                <LineChart data={costOverTime} xKey="name" yKey="value" color="#f59e0b" />
              </div>
            )}
          </div>

          {/* ROI Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              ROI Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Asset Investment</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPurchaseCost)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Maintenance Spend</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalMaintenanceCost)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Return on Investment</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{roi}%</p>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
