import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RefreshCw,
  ArrowLeft,
  Package,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import allocationService from '@/services/allocationService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { formatDate } from '@/utils/formatters';

export default function AllocationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const loadAllocation = async () => {
      setLoading(true);
      try {
        const res = await allocationService.getById(id);
        setAllocation(res.data || res);
      } catch {
        toast.error('Failed to load allocation details');
        navigate('/allocations');
      } finally {
        setLoading(false);
      }
    };
    loadAllocation();
  }, [id, navigate]);

  const handleReturn = async () => {
    setReturning(true);
    try {
      await allocationService.returnAsset(id);
      toast.success('Asset returned successfully');
      setShowReturnDialog(false);
      const res = await allocationService.getById(id);
      setAllocation(res.data || res);
    } catch {
      toast.error('Failed to return asset');
    } finally {
      setReturning(false);
    }
  };

  if (loading) return <LoadingSpinner centered />;
  if (!allocation) return null;

  const isOverdue =
    allocation.expectedReturnDate &&
    new Date(allocation.expectedReturnDate) < new Date() &&
    allocation.status === 'active';

  return (
    <div>
      <PageHeader
        title="Allocation Details"
        subtitle={`Allocation #${allocation.id?.slice(-8) || ''}`}
        icon={RefreshCw}
      >
        <button onClick={() => navigate('/allocations')} className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {allocation.status === 'active' && (
          <button
            onClick={() => setShowReturnDialog(true)}
            className="btn btn-primary"
          >
            <RotateCcw className="h-4 w-4" /> Return Asset
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Allocation Information
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <StatusBadge status={allocation.status} />
              {isOverdue && (
                <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" /> Overdue
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Assigned Date</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(allocation.allocatedDate)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Expected Return</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {allocation.expectedReturnDate
                    ? formatDate(allocation.expectedReturnDate)
                    : 'N/A'}
                </p>
              </div>
              {allocation.returnDate && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Actual Return</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(allocation.returnDate)}
                  </p>
                </div>
              )}
              {allocation.assignedBy && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Assigned By</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {allocation.assignedBy.firstName} {allocation.assignedBy.lastName}
                  </p>
                </div>
              )}
            </div>
            {allocation.notes && (
              <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{allocation.notes}</p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          {allocation.asset && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Asset Details
              </h3>
              <div
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => navigate(`/assets/${allocation.asset.id}`)}
              >
                <div className="flex items-start gap-3">
                  {allocation.asset.imageUrl || allocation.asset.image ? (
                    <img
                      src={allocation.asset.imageUrl || allocation.asset.image}
                      alt={allocation.asset.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {allocation.asset.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {allocation.asset.assetTag || allocation.asset.assetCode}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={allocation.asset.status} size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {allocation.employee && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Employee Details
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {allocation.employee.firstName} {allocation.employee.lastName}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {allocation.employee.email}
                  </p>
                </div>
                {allocation.employee.department && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {allocation.employee.department.name}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Asset Allocated</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(allocation.allocatedDate)}
                  </p>
                </div>
              </div>
              {allocation.returnDate && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <RotateCcw className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Asset Returned</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(allocation.returnDate)}
                    </p>
                  </div>
                </div>
              )}
              {!allocation.returnDate && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Pending Return</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {allocation.expectedReturnDate
                        ? `Expected by ${formatDate(allocation.expectedReturnDate)}`
                        : 'No return date set'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showReturnDialog}
        title="Return Asset"
        message={`Are you sure you want to mark "${allocation?.asset?.name || ''}" as returned?`}
        confirmLabel={returning ? 'Returning...' : 'Return Asset'}
        onConfirm={handleReturn}
        onCancel={() => setShowReturnDialog(false)}
        variant="info"
      />
    </div>
  );
}
