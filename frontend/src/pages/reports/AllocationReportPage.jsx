import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Percent,
  FileText,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '@/services/reportService';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PieChart, LineChart, BarChart } from '@/components/ui/Charts';

export default function AllocationReportPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [exporting, setExporting] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getAllocationReport();
      const data = res?.data || res;
      setReport(data);
    } catch {
      toast.error('Failed to load allocation report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const blob = format === 'pdf'
        ? await reportService.exportPDF('allocations', {})
        : await reportService.exportExcel('allocations', {});

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `allocation-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(null);
    }
  };

  const activeVsReturned = report?.activeVsReturned || report?.statusDistribution || [
    { name: 'Active', value: report?.activeAllocations || 0 },
    { name: 'Returned', value: report?.returnedAllocations || 0 },
  ];

  const allocationsOverTime = report?.allocationsOverTime || report?.trend || [];
  const departmentAllocation = report?.departmentAllocation || report?.byDepartment || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Allocation Report" subtitle="Asset allocation statistics and utilization" icon={GitBranch}>
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

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Utilization Rate"
              value={`${report?.utilizationRate || 0}%`}
              icon={Percent}
              color="green"
            />
            <StatsCard
              title="Active Allocations"
              value={report?.activeAllocations || 0}
              icon={GitBranch}
              color="blue"
            />
            <StatsCard
              title="Total Allocations"
              value={report?.totalAllocations || 0}
              icon={GitBranch}
              color="purple"
            />
            <StatsCard
              title="Overdue Returns"
              value={report?.overdueReturns || 0}
              icon={GitBranch}
              color="red"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active vs Returned</h3>
              <PieChart data={activeVsReturned} />
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department-wise Allocation</h3>
              <BarChart data={departmentAllocation} xKey="name" yKey="value" color="#8b5cf6" />
            </div>
          </div>

          {allocationsOverTime.length > 0 && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allocations Over Time</h3>
              <LineChart data={allocationsOverTime} xKey="name" yKey="value" color="#3b82f6" />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
