import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Package, ArrowLeft, Upload, X } from 'lucide-react';
import assetService from '@/services/assetService';
import categoryService from '@/services/categoryService';
import departmentService from '@/services/departmentService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { assetSchema } from '@/utils/validators';
import { ASSET_STATUSES, ASSET_CONDITIONS } from '@/utils/constants';

export default function AssetEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assetSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [assetRes, catRes, deptRes] = await Promise.all([
          assetService.getById(id),
          categoryService.getAll(),
          departmentService.getAll(),
        ]);
        const asset = assetRes.data || assetRes;
        setCategories(catRes.data?.categories || catRes.data || catRes.categories || []);
        setDepartments(deptRes.data?.departments || deptRes.data || deptRes.departments || []);
        reset({
          name: asset.name || '',
          description: asset.description || '',
          assetTag: asset.assetTag || asset.assetCode || '',
          serialNumber: asset.serialNumber || '',
          categoryId: asset.categoryId || asset.category?.id || '',
          departmentId: asset.departmentId || asset.department?.id || '',
          location: asset.location || '',
          purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
          purchasePrice: asset.purchasePrice || '',
          currentValue: asset.currentValue || '',
          warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
          condition: asset.condition || '',
          status: asset.status || 'available',
          imageUrl: asset.imageUrl || asset.image || '',
        });
        if (asset.imageUrl || asset.image) {
          setImagePreview(asset.imageUrl || asset.image);
        }
      } catch {
        toast.error('Failed to load asset data');
        navigate('/assets');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        formData.append('image', imageFile);
        await assetService.update(id, formData);
      } else {
        await assetService.update(id, data);
      }
      toast.success('Asset updated successfully');
      navigate(`/assets/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner centered />;

  return (
    <div>
      <PageHeader title="Edit Asset" subtitle="Update asset information" icon={Package}>
        <button onClick={() => navigate(`/assets/${id}`)} className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Asset Name *</label>
                <input {...register('name')} className="input" placeholder="Enter asset name" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Asset Code *</label>
                <input {...register('assetTag')} className="input" placeholder="e.g. AST-001" />
                {errors.assetTag && <p className="text-xs text-red-500 mt-1">{errors.assetTag.message}</p>}
              </div>
              <div>
                <label className="label">Category *</label>
                <select {...register('categoryId')} className="input">
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
              </div>
              <div>
                <label className="label">Serial Number</label>
                <input {...register('serialNumber')} className="input" placeholder="Enter serial number" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea
                  {...register('description')}
                  className="input"
                  rows={3}
                  placeholder="Asset description"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Purchase Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Purchase Date</label>
                <input type="date" {...register('purchaseDate')} className="input" />
              </div>
              <div>
                <label className="label">Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('purchasePrice', { valueAsNumber: true })}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="label">Warranty Expiry</label>
                <input type="date" {...register('warrantyExpiry')} className="input" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Location & Department
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Department *</label>
                <select {...register('departmentId')} className="input">
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && <p className="text-xs text-red-500 mt-1">{errors.departmentId.message}</p>}
              </div>
              <div>
                <label className="label">Location</label>
                <input {...register('location')} className="input" placeholder="e.g. Building A, Floor 3" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status & Condition
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select {...register('status')} className="input">
                  {ASSET_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Condition</label>
                <select {...register('condition')} className="input">
                  <option value="">Select condition</option>
                  {ASSET_CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Asset Image
            </h3>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Upload Image</span>
                <span className="text-xs text-gray-400 mt-1">Max 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </motion.div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Updating...' : 'Update Asset'}
            </button>
            <button type="button" onClick={() => navigate(`/assets/${id}`)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
