import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import auditService from '@/services/auditService';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'discrepancy', label: 'Discrepancy' },
  { value: 'missing', label: 'Missing' },
  { value: 'damaged', label: 'Damaged' },
];

const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' },
];

export default function AuditItemRow({ item, cycleId, onUpdated }) {
  const [status, setStatus] = useState(item.status || 'pending');
  const [condition, setCondition] = useState(item.condition || 'good');
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(item.status === 'verified');

  const handleSave = async () => {
    setSaving(true);
    try {
      await auditService.updateItem(item.id || item._id, {
        status,
        condition,
        notes,
        verified: status === 'verified',
      });
      toast.success('Item updated');
      onUpdated?.();
    } catch {
      toast.error('Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifiedToggle = async () => {
    const newVerified = !verified;
    setVerified(newVerified);
    const newStatus = newVerified ? 'verified' : 'pending';
    setStatus(newStatus);
    try {
      await auditService.updateItem(item.id || item._id, {
        status: newStatus,
        condition,
        notes,
        verified: newVerified,
      });
      toast.success(newVerified ? 'Item verified' : 'Verification removed');
      onUpdated?.();
    } catch {
      setVerified(!newVerified);
      setStatus(item.status || 'pending');
      toast.error('Failed to update verification');
    }
  };

  return (
    <div className="card p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Asset Info */}
        <div className="flex-shrink-0 lg:w-48">
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {item.asset?.name || item.assetName || 'Unknown Asset'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {item.asset?.assetTag || item.assetTag || 'N/A'}
          </p>
        </div>

        {/* Status */}
        <div className="flex-shrink-0 lg:w-36">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input text-sm py-1.5"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div className="flex-shrink-0 lg:w-32">
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="input text-sm py-1.5"
          >
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes..."
            className="input text-sm py-1.5"
          />
        </div>

        {/* Verified Checkbox */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={verified}
              onChange={handleVerifiedToggle}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Verified</span>
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-secondary btn-sm flex items-center gap-1 flex-shrink-0"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}
