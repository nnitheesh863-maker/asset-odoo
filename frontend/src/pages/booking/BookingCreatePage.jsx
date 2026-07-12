import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Calendar,
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { bookingSchema } from '@/utils/validators';

const RESOURCE_TYPES = [
  { value: 'meeting_room', label: 'Meeting Room' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'equipment', label: 'Equipment' },
];

export default function BookingCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      assetId: '',
      startDate: '',
      endDate: '',
      purpose: '',
      notes: '',
    },
  });

  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');
  const watchAssetId = watch('assetId');

  const checkAvailability = useCallback(async () => {
    if (!watchStartDate || !watchEndDate || !watchAssetId) return;
    setCheckingAvailability(true);
    try {
      const res = await bookingService.getAvailable({
        assetId: watchAssetId,
        startDate: watchStartDate,
        endDate: watchEndDate,
      });
      const slots = res.data?.slots || res.data || res.slots || [];
      setAvailableSlots(Array.isArray(slots) ? slots : []);
      const conf = res.data?.conflicts || res.conflicts || [];
      setConflicts(Array.isArray(conf) ? conf : []);
    } catch {
      setAvailableSlots([]);
      setConflicts([]);
    } finally {
      setCheckingAvailability(false);
    }
  }, [watchStartDate, watchEndDate, watchAssetId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability();
    }, 500);
    return () => clearTimeout(timer);
  }, [checkAvailability]);

  const onSubmit = async (data) => {
    if (conflicts.length > 0) {
      toast.error('Please resolve scheduling conflicts before submitting');
      return;
    }
    setSubmitting(true);
    try {
      await bookingService.create(data);
      toast.success('Booking created successfully');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New Booking"
        subtitle="Reserve a resource"
        icon={Calendar}
      >
        <button onClick={() => navigate('/bookings')} className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Resource Selection
            </h3>

            <div>
              <label className="label">Resource Type *</label>
              <select {...register('resourceType')} className="input">
                <option value="">Select resource type</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Resource *</label>
              <input
                {...register('assetId')}
                className="input"
                placeholder="Enter resource name or ID"
              />
              {errors.assetId && (
                <p className="text-xs text-red-500 mt-1">{errors.assetId.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Enter the name or ID of the resource you want to book
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-6 space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Schedule
            </h3>

            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                {...register('startDate', {
                  onChange: (e) => {
                    const date = e.target.value;
                    setValue('endDate', date);
                  },
                })}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time *</label>
                <input
                  type="datetime-local"
                  {...register('startDate')}
                  className="input"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <label className="label">End Time *</label>
                <input
                  type="datetime-local"
                  {...register('endDate')}
                  className="input"
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {checkingAvailability && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                Checking availability...
              </div>
            )}

            {!checkingAvailability && conflicts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Scheduling Conflict Detected
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    This resource is already booked for the selected time slot. Please choose a
                    different time.
                  </p>
                </div>
              </motion.div>
            )}

            {!checkingAvailability && availableSlots.length > 0 && conflicts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Time Slot Available
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    This resource is available for the selected time period.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Details
            </h3>

            <div>
              <label className="label">Purpose *</label>
              <input
                {...register('purpose')}
                className="input"
                placeholder="e.g. Team meeting, Project review..."
              />
              {errors.purpose && (
                <p className="text-xs text-red-500 mt-1">{errors.purpose.message}</p>
              )}
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                {...register('notes')}
                className="input"
                rows={3}
                placeholder="Additional notes or requirements..."
              />
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || conflicts.length > 0}
              className="btn btn-primary"
            >
              {submitting ? 'Creating...' : 'Create Booking'}
            </button>
            <button type="button" onClick={() => navigate('/bookings')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
