import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Package,
  Grid3X3,
  List,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import assetService from '@/services/assetService';
import categoryService from '@/services/categoryService';
import departmentService from '@/services/departmentService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import Select from '@/components/common/Select';
import StatusBadge from '@/components/common/StatusBadge';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ASSET_STATUSES, ASSET_CONDITIONS } from '@/utils/constants';

export default function AssetListPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [conditionFilter, setConditionFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMenuId, setActionMenuId] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        departmentId: departmentFilter || undefined,
        condition: conditionFilter || undefined,
      };
      const res = await assetService.getAll(params);
      setAssets(res.data?.assets || res.data || res.assets || []);
      setTotalItems(res.data?.total || res.total || res.data?.pagination?.total || 0);
    } catch (err) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, categoryFilter, departmentFilter, conditionFilter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          categoryService.getAll(),
          departmentService.getAll(),
        ]);
        const cats = catRes.data?.categories || catRes.data || catRes.categories || [];
        const depts = deptRes.data?.departments || deptRes.data || deptRes.departments || [];
        setCategories(Array.isArray(cats) ? cats : []);
        setDepartments(Array.isArray(depts) ? depts : []);
      } catch {}
    };
    loadFilters();
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await assetService.remove(deleteTarget.id);
      toast.success('Asset deleted successfully');
      setDeleteTarget(null);
      fetchAssets();
    } catch {
      toast.error('Failed to delete asset');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const headers = ['Asset Code', 'Name', 'Category', 'Serial Number', 'Status', 'Condition'];
    const rows = assets.map((a) => [
      a.assetTag || a.assetCode || '',
      a.name || '',
      a.category?.name || '',
      a.serialNumber || '',
      a.status || '',
      a.condition || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assets.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Assets exported successfully');
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const statusOptions = ASSET_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  const conditionOptions = ASSET_CONDITIONS.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  return (
    <div>
      <PageHeader
        title="Assets"
        subtitle="Manage your organization's assets"
        icon={Package}
        actionLabel="Register Asset"
        onAction={() => navigate('/assets/new')}
      >
        <button onClick={handleExport} className="btn btn-secondary">
          <Download className="h-4 w-4" />
          Export
        </button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search assets..."
          className="w-full sm:w-72"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          placeholder="All Statuses"
          className="w-full sm:w-40"
        />
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={(val) => {
            setCategoryFilter(val);
            setPage(1);
          }}
          placeholder="All Categories"
          className="w-full sm:w-44"
        />
        <Select
          options={departmentOptions}
          value={departmentFilter}
          onChange={(val) => {
            setDepartmentFilter(val);
            setPage(1);
          }}
          placeholder="All Departments"
          className="w-full sm:w-44"
        />
        <Select
          options={conditionOptions}
          value={conditionFilter}
          onChange={(val) => {
            setConditionFilter(val);
            setPage(1);
          }}
          placeholder="All Conditions"
          className="w-full sm:w-40"
        />
        <div className="flex items-center gap-1 ml-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No assets found"
          description="Get started by registering your first asset"
          actionLabel="Register Asset"
          onAction={() => navigate('/assets/new')}
        />
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assets.map((asset, idx) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/assets/${asset.id}`)}
              >
                <div className="relative mb-3">
                  {asset.imageUrl || asset.image ? (
                    <img
                      src={asset.imageUrl || asset.image}
                      alt={asset.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={asset.status} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {asset.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {asset.assetTag || asset.assetCode || 'N/A'}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {asset.category?.name || 'Uncategorized'}
                  </span>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuId(actionMenuId === asset.id ? null : asset.id);
                      }}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                    {actionMenuId === asset.id && (
                      <div className="absolute right-0 mt-1 z-50 w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assets/${asset.id}`);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assets/${asset.id}/edit`);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(asset);
                            setActionMenuId(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            onLimitChange={setLimit}
            limit={limit}
          />
        </>
      ) : (
        <>
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Asset Code
                  </th>
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Name
                  </th>
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Category
                  </th>
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Serial Number
                  </th>
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Condition
                  </th>
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Assigned To
                  </th>
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Location
                  </th>
                  <th className="table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    <td className="table-cell font-medium text-gray-900 dark:text-white">
                      {asset.assetTag || asset.assetCode || 'N/A'}
                    </td>
                    <td className="table-cell">{asset.name}</td>
                    <td className="table-cell text-gray-500 dark:text-gray-400">
                      {asset.category?.name || 'N/A'}
                    </td>
                    <td className="table-cell text-gray-500 dark:text-gray-400">
                      {asset.serialNumber || 'N/A'}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={asset.status} size="sm" />
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={asset.condition} size="sm" />
                    </td>
                    <td className="table-cell text-gray-500 dark:text-gray-400">
                      {asset.assignedTo
                        ? `${asset.assignedTo.firstName || ''} ${asset.assignedTo.lastName || ''}`
                        : 'Unassigned'}
                    </td>
                    <td className="table-cell text-gray-500 dark:text-gray-400">
                      {asset.location || 'N/A'}
                    </td>
                    <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View"
                        >
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => navigate(`/assets/${asset.id}/edit`)}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(asset)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            onLimitChange={setLimit}
            limit={limit}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Asset"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
}
