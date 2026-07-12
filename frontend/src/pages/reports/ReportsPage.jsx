import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Wrench,
  GitBranch,
  Building2,
  DollarSign,
  Activity,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';

const REPORT_TYPES = [
  {
    key: 'assets',
    title: 'Asset Report',
    description: 'Complete overview of all assets including status, categories, and growth trends.',
    icon: BarChart3,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    route: '/reports/assets',
  },
  {
    key: 'maintenance',
    title: 'Maintenance Report',
    description: 'Maintenance history, costs, priority distribution, and completion rates.',
    icon: Wrench,
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    route: '/reports/maintenance',
  },
  {
    key: 'allocations',
    title: 'Allocation Report',
    description: 'Asset allocation statistics, utilization rates, and department-wise breakdown.',
    icon: GitBranch,
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    route: '/reports/allocations',
  },
  {
    key: 'departments',
    title: 'Department Report',
    description: 'Department-wise asset distribution, employee counts, and utilization metrics.',
    icon: Building2,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    route: '/reports/departments',
  },
  {
    key: 'costs',
    title: 'Cost Report',
    description: 'Total cost analysis, cost by category, ROI calculations, and spending trends.',
    icon: DollarSign,
    color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    route: '/reports/costs',
  },
  {
    key: 'utilization',
    title: 'Utilization Report',
    description: 'Asset utilization rates, idle assets, and usage patterns across departments.',
    icon: Activity,
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    route: '/reports/assets',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Reports"
        subtitle="Generate and view detailed reports for your assets"
        icon={BarChart3}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          return (
            <motion.div key={report.key} variants={item}>
              <button
                onClick={() => navigate(report.route)}
                className="card p-6 w-full text-left hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all hover:-translate-y-0.5 group"
              >
                <div className={`inline-flex rounded-xl p-3 ${report.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                  {report.description}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                  Generate Report
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
