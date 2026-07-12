import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  Package,
  Percent,
  FileText,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '@/services/reportService';
import departmentService from '@/services/departmentService';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import Select from '@/components/common/Select';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { BarChart, PieChart } from '@/components/ui/Charts';

export default function DepartmentReportPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [exporting, setExporting] = useState(null);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentService.getAll({ limit: 200 });
      const data = res?.data || res;
      setDepartments(Array.isArray(data) ? data : data?.departments || []);
    } catch {
      // non-critical
    }
  }, []);

  const fetchReport = useCallback(async () => {
    if (!selectedDept) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await reportService.getDepartmentReport(selectedDept);
      const data = res?.data || res;
      setReport(data);
    } catch {
      toast.error('Failed to load department report');
    } finally {
      setLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (selectedDept) {
      fetchReport();
    } else {
      setReport(null);
      setLoading(false);
    }
  }, [selectedDept, fetchReport]);

  const handleExport = async (format) => {
    if (!selectedDept) return;
    setExporting(format);
    try {
      const blob = format === 'pdf'
        ? await reportService.exportPDF('departments', { departmentId: selectedDept })
        : await reportService.exportExcel('departments', { departmentId: selectedDept });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `department-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(null);
    }
  };

  const deptOptions = [
    { value: '', label: 'Select a department...' },
    ...departments.map((d) => ({ value: d.id || d._id, label: d.name })),
  ];

  const assetStatusData = report?.assetStatusDistribution || report?.assetsByStatus || [];
  const categoryData = report?.categoryDistribution || report?.assetsByCategory || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Department Report"
        subtitle="Department-wise asset and employee analysis"
        icon={Building2}
      >
        {selectedDept && (
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
        )}
      </PageHeader>

      {/* Department Selector */}
      <div className="mb-6 max-w-md">
        <Select
          options={deptOptions}
          value={selectedDept}
          onChange={setSelectedDept}
          label="Select Department"
        />
      </div>

      {!selectedDept ? (
        <EmptyState
          icon={Building2}
          title="Select a department"
          description="Choose a department from the dropdown above to view its report."
        />
      ) : loading ? (
        <LoadingSpinner centered />
      ) : report ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Assets"
              value={report?.totalAssets || report?.assetCount || 0}
              icon={Package}
              color="blue"
            />
            <StatsCard
              title="Employees"
              value={report?.totalEmployees || report?.employeeCount || 0}
              icon={Users}
              color="green"
            />
            <StatsCard
              title="Utilization Rate"
              value={`${report?.utilizationRate || 0}%`}
              icon={Percent}
              color="purple"
            />
            <StatsCard
              title="Active Assets"
              value={report?.activeAssets || 0}
              icon={Package}
              color="amber"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assetStatusData.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assets by Status</h3>
                <PieChart data={assetStatusData} />
              </div>
            )}
            {categoryData.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assets by Category</h3>
                <BarChart data={categoryData} xKey="name" yKey="value" color="#8b5cf6" />
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Building2}
          title="No data available"
          description="No report data found for the selected department."
        />
      )}
    </motion.div>
  );
}
