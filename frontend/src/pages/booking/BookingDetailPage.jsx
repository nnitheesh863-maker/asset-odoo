import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Calendar,
  ArrowLeft,
  Package,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  MessageSquare,
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useAuthContext } from '@/context/AuthContext';
import { formatDateTime, formatDate } from '@/utils/formatters';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState('');
  const [acting, setActing] = useState(false);

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getById(id);
        setBooking(res.data || res);
      } catch {
        toast.error('Failed to load booking details');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [id, navigate]);

  const handleAction = async () => {
    if (!actionType) return;
    setActing(true);
    try {
      if (actionType === 'approve') {
        await bookingService.approve(id);
        toast.success('Booking approved');
      } else if (actionType === 'reject') {
        await bookingService.reject(id);
        toast.success('Booking rejected');
      } else if (actionType === 'cancel') {
        await bookingService.cancel(id);
        toast.success('Booking cancelled');
      }
      setActionType('');
      const res = await bookingService.getById(id);
      setBooking(res.data || res);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const getActionLabel = () => {
    switch (actionType) {
      case 'approve': return 'Approve';
      case 'reject': return 'Reject';
      case 'cancel': return 'Cancel Booking';
      default: return 'Confirm';
    }
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'approve': return 'Approve Booking';
      case 'reject': return 'Reject Booking';
      case 'cancel': return 'Cancel Booking';
      default: return 'Confirm';
    }
  };

  if (loading) return <LoadingSpinner centered />;
  if (!booking) return null;

  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const durationHours = Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;

  return (
    <div>
      <PageHeader
        title="Booking Details"
        subtitle={booking.resourceName || booking.asset?.name || 'Resource Booking'}
        icon={Calendar}
      >
        <button onClick={() => navigate('/bookings')} className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {isManager && booking.status === 'pending' && (
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
        {booking.userId === user?.id && booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <button
            onClick={() => setActionType('cancel')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            <Ban className="h-4 w-4" /> Cancel Booking
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
              Booking Information
            </h3>
            <div className="mb-4">
              <StatusBadge status={booking.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Start Time</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDateTime(booking.startDate)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">End Time</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDateTime(booking.endDate)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {durationHours} hours
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resource Type</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {booking.resourceType || 'N/A'}
                </p>
              </div>
            </div>
            {booking.purpose && (
              <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Purpose</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{booking.purpose}</p>
              </div>
            )}
            {booking.notes && (
              <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{booking.notes}</p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          {booking.asset && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Package className="h-5 w-5 inline mr-2" />
                Resource Details
              </h3>
              <div
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => navigate(`/assets/${booking.asset.id}`)}
              >
                <div className="flex items-start gap-3">
                  {booking.asset.imageUrl || booking.asset.image ? (
                    <img
                      src={booking.asset.imageUrl || booking.asset.image}
                      alt={booking.asset.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {booking.asset.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {booking.asset.assetTag || booking.asset.assetCode}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {booking.user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <User className="h-5 w-5 inline mr-2" />
                Booked By
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.user.firstName} {booking.user.lastName}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.user.email}
                  </p>
                </div>
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
              Status Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Booking Created</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(booking.createdAt)}
                  </p>
                </div>
              </div>

              {booking.approvedDate && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Approved</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(booking.approvedDate)}
                    </p>
                  </div>
                </div>
              )}

              {booking.status === 'rejected' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Rejected</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {booking.rejectedDate ? formatDateTime(booking.rejectedDate) : ''}
                    </p>
                  </div>
                </div>
              )}

              {booking.status === 'cancelled' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Ban className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Cancelled</p>
                  </div>
                </div>
              )}

              {booking.status === 'active' && !booking.approvedDate && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {booking.status === 'active' ? 'In Progress' : 'Pending'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!actionType}
        title={getDialogTitle()}
        message={`Are you sure you want to ${actionType} this booking for "${booking?.resourceName || booking?.asset?.name || ''}"?`}
        confirmLabel={acting ? 'Processing...' : getActionLabel()}
        onConfirm={handleAction}
        onCancel={() => setActionType('')}
        variant={actionType === 'approve' ? 'info' : actionType === 'cancel' ? 'warning' : 'danger'}
      />
    </div>
  );
}
