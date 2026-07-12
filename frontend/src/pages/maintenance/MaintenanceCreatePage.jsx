import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import maintenanceService from '@/services/maintenanceService';
import assetService from '@/services/assetService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { maintenanceSchema } from '@/utils/validators';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300' },
  { value: 'high', label: 'High', color: 'bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300' },
];

const TYPE_OPTIONS = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'corrective', label: 'Corrective' },
  { value: 'predictive', label: 'Predictive' },
  { value: 'emergency', label: 'Emergency' },
];

export default function MaintenanceCreatePage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      assetId: '',
      type: 'corrective',
      title: '',
      description: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      notes: '',
      estimatedCost: undefined,
    },
  });

  const selectedPriority = watch('priority');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await assetService.getAll({ limit: 500 });
        const data = res?.data || res;
        setAssets(Array.isArray(data) ? data : data?.assets || []);
      } catch {
        toast.error('Failed to load assets');
      } finally {
        setLoadingAssets(false);
      }
    };
    fetchAssets();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : undefined,
      };
      await maintenanceService.create(payload);
      toast.success('Maintenance request created successfully');
      navigate('/maintenance');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create maintenance request');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="New Maintenance Request" subtitle="Submit a new maintenance request" icon={Wrench}>
        <button onClick={() => navigate('/maintenance')} className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </PageHeader>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
          {/* Asset Selection */}
          <div>
            <label className="label">Asset *</label>
            {loadingAssets ? (
              <LoadingSpinner size="sm" />
            ) : (
              <select
                {...register('assetId')}
                className={`input ${errors.assetId ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              >
                <option value="">Select an asset...</option>
                {assets.map((asset) => (
                  <option key={asset.id || asset._id} value={asset.id || asset._id}>
                    {asset.name} {asset.assetTag ? `(${asset.assetTag})` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.assetId && <p className="text-xs text-red-500 mt-1">{errors.assetId.message}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="label">Issue Title *</label>
            <input
              type="text"
              placeholder="Brief description of the issue"
              className={`input ${errors.title ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              rows={4}
              placeholder="Detailed description of the issue..."
              className={`input resize-none ${errors.description ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="label">Maintenance Type *</label>
            <select
              {...register('type')}
              className={`input ${errors.type ? 'border-red-500 focus:ring-red-500/20' : ''}`}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="label">Priority *</label>
            <div className="grid grid-cols-4 gap-3">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('priority', opt.value, { shouldValidate: true })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium text-center transition-all ${
                    selectedPriority === opt.value
                      ? `${opt.color} ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-900`
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>}
          </div>

          {/* Scheduled Date & Estimated Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Scheduled Date *</label>
              <input
                type="date"
                className={`input ${errors.scheduledDate ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('scheduledDate')}
              />
              {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate.message}</p>}
            </div>
            <div>
              <label className="label">Estimated Cost</label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                className="input"
                {...register('estimatedCost')}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <textarea
              rows={3}
              placeholder="Any additional information..."
              className="input resize-none"
              {...register('notes')}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => navigate('/maintenance')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary flex items-center gap-2">
              {isSubmitting ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
