import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Truck,
  ArrowLeft,
  Package,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import transferService from '@/services/transferService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useAuthContext } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatters';

export default function TransferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState('');
  const [acting, setActing] = useState(false);

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    const loadTransfer = async () => {
      setLoading(true);
      try {
        const res = await transferService.getById(id);
        setTransfer(res.data || res);
      } catch {
        toast.error('Failed to load transfer details');
        navigate('/transfers');
      } finally {
        setLoading(false);
      }
    };
    loadTransfer();
  }, [id, navigate]);

  const handleAction = async () => {
    if (!actionType) return;
    setActing(true);
    try {
      if (actionType === 'approve') {
        await transferService.approve(id);
        toast.success('Transfer approved');
      } else {
        await transferService.reject(id);
        toast.success('Transfer rejected');
      }
      setActionType('');
      const res = await transferService.getById(id);
      setTransfer(res.data || res);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <LoadingSpinner centered />;
  if (!transfer) return null;

  return (
    <div>
      <PageHeader
        title="Transfer Details"
        subtitle={`Transfer #${transfer.id?.slice(-8) || ''}`}
        icon={Truck}
      >
        <button onClick={() => navigate('/transfers')} className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {isManager && transfer.status === 'pending' && (
          <>
            <button
              onClick={() => setActionType('reject')}
              className="btn bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
            <button
              onClick={() => setActionType('approve')}
              className="btn bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
            >
              <CheckCircle className="h-4 w-4" /> Approve
            </button>
          </>
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
              Transfer Information
            </h3>
            <div className="mb-4">
              <StatusBadge status={transfer.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Requested Date</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(transfer.createdAt || transfer.transferDate)}
                </p>
              </div>
              {transfer.approvedDate && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Approved Date</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(transfer.approvedDate)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {transfer.reason && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                <MessageSquare className="h-5 w-5 inline mr-2" />
                Reason for Transfer
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {transfer.reason}
              </p>
              {transfer.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Additional Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{transfer.notes}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {transfer.asset && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Package className="h-5 w-5 inline mr-2" />
                Asset
              </h3>
              <div
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => navigate(`/assets/${transfer.asset.id}`)}
              >
                <div className="flex items-start gap-3">
                  {transfer.asset.imageUrl || transfer.asset.image ? (
                    <img
                      src={transfer.asset.imageUrl || transfer.asset.image}
                      alt={transfer.asset.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {transfer.asset.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transfer.asset.assetTag || transfer.asset.assetCode}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Transfer Flow
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {transfer.fromEmployee
                    ? `${transfer.fromEmployee.firstName || ''} ${transfer.fromEmployee.lastName || ''}`
                    : transfer.fromUser || 'N/A'}
                </p>
                {transfer.fromDepartment && (
                  <div className="flex items-center gap-1 mt-1">
                    <Building2 className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transfer.fromDepartment.name || transfer.fromDepartment}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">To</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {transfer.toEmployee
                    ? `${transfer.toEmployee.firstName || ''} ${transfer.toEmployee.lastName || ''}`
                    : transfer.toUser || 'N/A'}
                </p>
                {transfer.toDepartment && (
                  <div className="flex items-center gap-1 mt-1">
                    <Building2 className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transfer.toDepartment.name || transfer.toDepartment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {transfer.requestedBy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Requested By
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {transfer.requestedBy.firstName} {transfer.requestedBy.lastName}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!actionType}
        title={actionType === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}
        message={
          actionType === 'approve'
            ? 'Are you sure you want to approve this transfer?'
            : 'Are you sure you want to reject this transfer?'
        }
        confirmLabel={acting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
        onConfirm={handleAction}
        onCancel={() => setActionType('')}
        variant={actionType === 'approve' ? 'info' : 'danger'}
      />
    </div>
  );
}
