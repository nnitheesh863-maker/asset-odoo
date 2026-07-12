import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  Package,
  Edit3,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import StatsCard from '@/components/common/StatsCard';
import departmentService from '@/services/departmentService';
import { formatDate } from '@/utils/formatters';

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartment();
  }, [id]);

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptRes, statsRes] = await Promise.all([
        departmentService.getById(id),
        departmentService.getStats(id).catch(() => null),
      ]);
      setDepartment(deptRes.data);
      setStats(statsRes?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load department');
      toast.error('Failed to load department');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner centered size="lg" />;

  if (error || !department) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Department not found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {error || 'The requested department could not be found'}
        </p>
        <button onClick={() => navigate('/departments')} className="btn btn-primary">
          Back to Departments
        </button>
      </div>
    );
  }

  const employees = department.employees || [];
  const assets = department.assets || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/departments')}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">{department.name}</h1>
          {department.code && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Code: {department.code}</p>
          )}
        </div>
        <button
          onClick={() => navigate(`/departments/${id}/edit`)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department Name
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                  {department.name}
                </p>
              </div>
            </div>

            {department.description && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                    {department.description}
                  </p>
                </div>
              </div>
            )}

            {department.managerName && (
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Manager
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {department.managerName}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={department.status || 'active'} />
                </div>
              </div>
            </div>

            {department.createdAt && (
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                    {formatDate(department.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Assets"
            value={stats.totalAssets ?? assets.length}
            icon={Package}
            color="blue"
          />
          <StatsCard
            title="Employees"
            value={stats.totalEmployees ?? employees.length}
            icon={Users}
            color="green"
          />
          <StatsCard
            title="Active Allocations"
            value={stats.activeAllocations ?? 0}
            icon={UserCheck}
            color="purple"
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-500" />
            Employees ({employees.length})
          </h3>
        </div>
        {employees.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No employees in this department
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <td className="table-cell">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {emp.firstName} {emp.lastName}
                      </p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{emp.email}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {emp.designation || '-'}
                      </p>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={emp.status || 'active'} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
