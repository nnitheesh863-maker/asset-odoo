import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Truck, ArrowLeft } from 'lucide-react';
import transferService from '@/services/transferService';
import assetService from '@/services/assetService';
import employeeService from '@/services/employeeService';
import departmentService from '@/services/departmentService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { transferSchema } from '@/utils/validators';

export default function TransferCreatePage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      assetId: '',
      fromDepartmentId: '',
      toDepartmentId: '',
      fromEmployeeId: '',
      toEmployeeId: '',
      reason: '',
      transferDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [assetRes, empRes, deptRes] = await Promise.all([
          assetService.getAll(),
          employeeService.getAll(),
          departmentService.getAll(),
        ]);
        setAssets(assetRes.data?.assets || assetRes.data || assetRes.assets || []);
        setEmployees(empRes.data?.employees || empRes.data || empRes.employees || []);
        setDepartments(deptRes.data?.departments || deptRes.data || deptRes.departments || []);
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
      await transferService.create(data);
      toast.success('Transfer request created');
      navigate('/transfers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) return <LoadingSpinner centered />;

  const assetList = Array.isArray(assets) ? assets : [];
  const employeeList = Array.isArray(employees) ? employees : [];
  const departmentList = Array.isArray(departments) ? departments : [];

  return (
    <div>
      <PageHeader
        title="New Transfer"
        subtitle="Request an asset transfer"
        icon={Truck}
      >
        <button onClick={() => navigate('/transfers')} className="btn btn-secondary">
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
              {assetList.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.assetTag || asset.assetCode || 'N/A'})
                </option>
              ))}
            </select>
            {errors.assetId && (
              <p className="text-xs text-red-500 mt-1">{errors.assetId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">From Department *</label>
              <select {...register('fromDepartmentId')} className="input">
                <option value="">Select department</option>
                {departmentList.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.fromDepartmentId && (
                <p className="text-xs text-red-500 mt-1">{errors.fromDepartmentId.message}</p>
              )}
            </div>
            <div>
              <label className="label">To Department *</label>
              <select {...register('toDepartmentId')} className="input">
                <option value="">Select department</option>
                {departmentList.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.toDepartmentId && (
                <p className="text-xs text-red-500 mt-1">{errors.toDepartmentId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">From Employee</label>
              <select {...register('fromEmployeeId')} className="input">
                <option value="">Select employee</option>
                {employeeList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">To Employee *</label>
              <select {...register('toEmployeeId')} className="input">
                <option value="">Select employee</option>
                {employeeList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              {errors.toEmployeeId && (
                <p className="text-xs text-red-500 mt-1">{errors.toEmployeeId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Transfer Date *</label>
            <input
              type="date"
              {...register('transferDate')}
              className="input"
            />
            {errors.transferDate && (
              <p className="text-xs text-red-500 mt-1">{errors.transferDate.message}</p>
            )}
          </div>

          <div>
            <label className="label">Reason *</label>
            <textarea
              {...register('reason')}
              className="input"
              rows={3}
              placeholder="Why is this transfer needed?"
            />
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <label className="label">Additional Notes</label>
            <textarea
              {...register('notes')}
              className="input"
              rows={2}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Submit Transfer Request'}
            </button>
            <button type="button" onClick={() => navigate('/transfers')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
