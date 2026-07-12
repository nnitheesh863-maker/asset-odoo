import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';
import auditService from '@/services/auditService';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import Tabs from '@/components/common/Tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ProgressBar from '@/components/common/ProgressBar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import AuditItemRow from './AuditItemRow';
import { formatDate } from '@/utils/formatters';

const TABS = [
  { key: 'all', label: 'All Items' },
  { key: 'verified', label: 'Verified' },
  { key: 'discrepancy', label: 'Discrepancies' },
  { key: 'pending', label: 'Pending' },
];

export default function AuditDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completing, setCompleting] = useState(false);

  const fetchCycle = useCallback(async () => {
    try {
      const res = await auditService.getCycleById(id);
      const data = res?.data || res;
      setCycle(data);
    } catch {
      toast.error('Failed to load audit cycle');
      navigate('/audit');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCycle();
  }, [fetchCycle]);

  const items = cycle?.items || [];

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items;
    if (activeTab === 'verified') return items.filter((i) => i.status === 'verified');
    if (activeTab === 'discrepancy') return items.filter((i) => i.status === 'discrepancy');
    if (activeTab === 'pending') return items.filter((i) => !i.status || i.status === 'pending' || i.status === 'missing' || i.status === 'damaged');
    return items;
  }, [items, activeTab]);

  const verifiedCount = items.filter((i) => i.status === 'verified').length;
  const discrepancyCount = items.filter((i) => i.status === 'discrepancy').length;
  const progress = items.length > 0 ? Math.round((verifiedCount / items.length) * 100) : 0;
  const allVerified = items.length > 0 && verifiedCount === items.length;

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await auditService.completeCycle(id);
      toast.success('Audit cycle completed successfully');
      setShowCompleteConfirm(false);
      fetchCycle();
    } catch {
      toast.error('Failed to complete audit cycle');
    } finally {
      setCompleting(false);
    }
  };

  const handleItemUpdated = () => {
    fetchCycle();
  };

  if (loading) return <LoadingSpinner centered />;

  if (!cycle) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={cycle.name || 'Audit Cycle'}
        subtitle={cycle.description || `Department: ${cycle.department?.name || cycle.departmentName || 'N/A'}`}
        icon={ClipboardCheck}
      >
        <button onClick={() => navigate('/audit')} className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </PageHeader>

      {/* Cycle Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
            <StatusBadge status={cycle.status} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Start</span>
            <span className="text-gray-900 dark:text-white">{formatDate(cycle.startDate)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500 dark:text-gray-400">End</span>
            <span className="text-gray-900 dark:text-white">{formatDate(cycle.endDate)}</span>
          </div>
        </div>

        <div className="card p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Progress</h4>
          <ProgressBar value={progress} color="green" showLabel />
          <p className="text-xs text-gray-400 mt-2">
            {verifiedCount} of {items.length} items verified
          </p>
        </div>

        <div className="card p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Summary</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Items</span>
              <span className="font-medium text-gray-900 dark:text-white">{items.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Verified
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">{verifiedCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Discrepancies
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">{discrepancyCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Items */}
      <div className="mb-4">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No items in this category"
          description="No audit items match the current filter."
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <AuditItemRow
              key={item.id || item._id}
              item={item}
              cycleId={id}
              onUpdated={handleItemUpdated}
            />
          ))}
        </div>
      )}

      {/* Complete Button */}
      {cycle.status !== 'completed' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowCompleteConfirm(true)}
            disabled={!allVerified || completing}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!allVerified ? 'Verify all items before completing' : 'Complete audit cycle'}
          >
            {completing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Play className="h-4 w-4" />
                Complete Audit Cycle
              </>
            )}
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showCompleteConfirm}
        title="Complete Audit Cycle"
        message="Are you sure you want to complete this audit cycle? All items must be verified."
        confirmLabel="Complete"
        onCancel={() => setShowCompleteConfirm(false)}
        onConfirm={handleComplete}
        variant="info"
      />
    </motion.div>
  );
}
