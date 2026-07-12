import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ClipboardCheck, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import auditService from '@/services/auditService';
import departmentService from '@/services/departmentService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const auditCycleSchema = z.object({
  name: z.string().min(1, 'Cycle name is required').max(200),
  description: z.string().max(1000).optional(),
  departmentId: z.string().min(1, 'Department is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export default function AuditCreatePage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(auditCycleSchema),
    defaultValues: {
      name: '',
      description: '',
      departmentId: '',
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getAll({ limit: 200 });
        const data = res?.data || res;
        setDepartments(Array.isArray(data) ? data : data?.departments || []);
      } catch {
        toast.error('Failed to load departments');
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  const onSubmit = async (data) => {
    try {
      await auditService.createCycle(data);
      toast.success('Audit cycle created successfully');
      navigate('/audit');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create audit cycle');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="New Audit Cycle"
        subtitle="Create a new audit cycle for asset verification"
        icon={ClipboardCheck}
      >
        <button onClick={() => navigate('/audit')} className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </PageHeader>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="label">Cycle Name *</label>
            <input
              type="text"
              placeholder="e.g. Q1 2026 IT Assets Audit"
              className={`input ${errors.name ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              placeholder="Brief description of this audit cycle..."
              className="input resize-none"
              {...register('description')}
            />
          </div>

          {/* Department */}
          <div>
            <label className="label">Department *</label>
            {loadingDepts ? (
              <LoadingSpinner size="sm" />
            ) : (
              <select
                {...register('departmentId')}
                className={`input ${errors.departmentId ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              >
                <option value="">Select a department...</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept._id} value={dept.id || dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
            {errors.departmentId && <p className="text-xs text-red-500 mt-1">{errors.departmentId.message}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input
                type="date"
                className={`input ${errors.startDate ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('startDate')}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="label">End Date *</label>
              <input
                type="date"
                className={`input ${errors.endDate ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('endDate')}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => navigate('/audit')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary flex items-center gap-2">
              {isSubmitting ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4" />}
              Create Audit Cycle
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
