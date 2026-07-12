import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Edit3,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Wrench,
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import StatsCard from '@/components/common/StatsCard';
import Avatar from '@/components/common/Avatar';
import employeeService from '@/services/employeeService';
import { formatDate } from '@/utils/formatters';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empRes, assetsRes] = await Promise.all([
        employeeService.getById(id),
        employeeService.getAssets(id).catch(() => ({ data: [] })),
      ]);
      setEmployee(empRes.data);
      setAssets(assetsRes.data?.assets || assetsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load employee');
      toast.error('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner centered size="lg" />;

  if (error || !employee) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Employee not found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {error || 'The requested employee could not be found'}
        </p>
        <button onClick={() => navigate('/employees')} className="btn btn-primary">
          Back to Employees
        </button>
      </div>
    );
  }

  const allocationHistory = employee.allocationHistory || [];
  const maintenanceRequests = employee.maintenanceRequests || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {employee.employeeId}
          </p>
        </div>
        <button
          onClick={() => navigate(`/employees/${id}/edit`)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar
            name={`${employee.firstName} ${employee.lastName}`}
            size="lg"
            src={employee.avatar}
          />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-sm text-gray-900 dark:text-white mt-0.5">{employee.email}</p>
              </div>
            </div>

            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-0.5">{employee.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </p>
                <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                  {employee.departmentName || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Designation
                </p>
                <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                  {employee.designation || '-'}
                </p>
              </div>
            </div>

            {employee.dateOfJoining && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date of Joining
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                    {formatDate(employee.dateOfJoining)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={employee.status || 'active'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Assigned Assets"
          value={assets.length}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Allocation History"
          value={allocationHistory.length}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Maintenance Requests"
          value={maintenanceRequests.length}
          icon={Wrench}
          color="amber"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-primary-500" />
            Assigned Assets ({assets.length})
          </h3>
        </div>
        {assets.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No assets currently assigned
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset Name
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Allocated Date
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {assets.map((asset, idx) => (
                  <tr
                    key={asset.id || idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer"
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    <td className="table-cell">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {asset.name}
                      </p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {asset.assetTag}
                      </p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {asset.categoryName || '-'}
                      </p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(asset.allocatedDate || asset.createdAt)}
                      </p>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={asset.status || 'allocated'} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {allocationHistory.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary-500" />
              Allocation History ({allocationHistory.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Allocated
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Returned
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {allocationHistory.map((alloc, idx) => (
                  <tr key={alloc.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="table-cell">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {alloc.assetName}
                      </p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(alloc.allocatedDate)}
                      </p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {alloc.returnedDate ? formatDate(alloc.returnedDate) : '-'}
                      </p>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={alloc.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {maintenanceRequests.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary-500" />
              Maintenance Requests ({maintenanceRequests.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="table-cell text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {maintenanceRequests.map((req, idx) => (
                  <tr key={req.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="table-cell">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{req.title}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{req.assetName}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">{req.type}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(req.scheduledDate)}
                      </p>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
