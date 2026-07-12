import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import allocationService from '@/services/allocationService';
import assetService from '@/services/assetService';
import employeeService from '@/services/employeeService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { allocationSchema } from '@/utils/validators';

export default function AllocationCreatePage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      assetId: '',
      employeeId: '',
      allocatedDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [assetRes, empRes] = await Promise.all([
          assetService.getAll({ status: 'available' }),
          employeeService.getAll(),
        ]);
        const assetList = assetRes.data?.assets || assetRes.data || assetRes.assets || [];
        setAssets(Array.isArray(assetList) ? assetList : []);
        const empList = empRes.data?.employees || empRes.data || empRes.employees || [];
        setEmployees(Array.isArray(empList) ? empList : []);
      } catch {
        toast.error('Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await allocationService.create(data);
      toast.success('Allocation created successfully');
      navigate('/allocations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create allocation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) return <LoadingSpinner centered />;

  const assetOptions = assets.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.assetTag || a.assetCode || 'N/A'})`,
  }));

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName || ''} ${e.lastName || ''}`,
  }));

  return (
    <div>
      <PageHeader
        title="New Allocation"
        subtitle="Allocate an asset to an employee"
        icon={RefreshCw}
      >
        <button onClick={() => navigate('/allocations')} className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-5"
        >
          <div>
            <label className="label">Asset *</label>
            <select {...register('assetId')} className="input">
              <option value="">Select an asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.assetTag || asset.assetCode || 'N/A'})
                </option>
              ))}
            </select>
            {errors.assetId && (
              <p className="text-xs text-red-500 mt-1">{errors.assetId.message}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Only available assets are shown</p>
          </div>

          <div>
            <label className="label">Employee *</label>
            <select {...register('employeeId')} className="input">
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
            {errors.employeeId && (
              <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Assigned Date *</label>
              <input
                type="date"
                {...register('allocatedDate')}
                className="input"
              />
              {errors.allocatedDate && (
                <p className="text-xs text-red-500 mt-1">{errors.allocatedDate.message}</p>
              )}
            </div>
            <div>
              <label className="label">Expected Return Date</label>
              <input
                type="date"
                {...register('expectedReturnDate')}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Remarks</label>
            <textarea
              {...register('notes')}
              className="input"
              rows={3}
              placeholder="Additional notes about this allocation..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create Allocation'}
            </button>
            <button type="button" onClick={() => navigate('/allocations')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
