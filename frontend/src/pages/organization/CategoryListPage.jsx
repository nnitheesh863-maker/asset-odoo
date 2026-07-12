import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  LayoutGrid,
  Package,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import categoryService from '@/services/categoryService';
import { categorySchema } from '@/utils/validators';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const confirm = useConfirmDialog();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      parentId: '',
      depreciationRate: '',
    },
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await categoryService.getAll(params);
      setCategories(response.data?.categories || response.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCat(null);
    resetForm({ name: '', code: '', description: '', parentId: '', depreciationRate: '' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    resetForm({
      name: cat.name || '',
      code: cat.code || '',
      description: cat.description || '',
      parentId: cat.parentId || '',
      depreciationRate: cat.depreciationRate ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCat(null);
    resetForm();
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        depreciationRate: data.depreciationRate ? Number(data.depreciationRate) : undefined,
        parentId: data.parentId || undefined,
      };
      if (editingCat) {
        await categoryService.update(editingCat.id, payload);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(payload);
        toast.success('Category created successfully');
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(err?.message || 'Operation failed');
    }
  };

  const handleDelete = async (cat) => {
    const confirmed = await confirm.openDialog({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${cat.name}"? Assets in this category may be affected.`,
    });
    if (!confirmed) return;
    try {
      await categoryService.remove(cat.id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete category');
    }
  };

  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Asset Categories"
        subtitle="Organize your assets by category"
        icon={Tag}
        actionLabel="Add Category"
        onAction={openCreateModal}
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search categories..."
        className="max-w-sm"
      />

      {loading ? (
        <LoadingSpinner centered size="lg" />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description={search ? 'Try adjusting your search' : 'Create your first category to organize assets'}
          actionLabel={!search ? 'Add Category' : undefined}
          onAction={!search ? openCreateModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-xl bg-primary-100 dark:bg-primary-900/30 p-2.5 flex-shrink-0">
                    <LayoutGrid className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{cat.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {cat.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                  {cat.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {cat.assetCount ?? 0} assets
                  </span>
                </div>
                {cat.depreciationRate != null && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {cat.depreciationRate}% dep.
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCat ? 'Edit Category' : 'Create Category'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Category name</label>
            <input
              type="text"
              placeholder="e.g. Laptops"
              className={`input ${errors.name ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Category code</label>
            <input
              type="text"
              placeholder="e.g. LAP"
              className={`input ${errors.code ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('code')}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="label">Description <span className="text-gray-400">(optional)</span></label>
            <textarea
              rows={3}
              placeholder="Brief description of this category"
              className={`input resize-none ${errors.description ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Parent category <span className="text-gray-400">(optional)</span></label>
              <select
                className="input"
                {...register('parentId')}
              >
                <option value="">None (top-level)</option>
                {parentCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Depreciation rate (%) <span className="text-gray-400">(optional)</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0"
                className={`input ${errors.depreciationRate ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('depreciationRate')}
              />
              {errors.depreciationRate && (
                <p className="text-xs text-red-500 mt-1">{errors.depreciationRate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : editingCat ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
        variant="danger"
      />
    </motion.div>
  );
}
