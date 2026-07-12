import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench,
  ArrowLeft,
  User,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import maintenanceService from '@/services/maintenanceService';
import employeeService from '@/services/employeeService';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { formatDate, formatCurrency, getPriorityColor } from '@/utils/formatters';

const STATUS_STEPS = [
  { key: 'requested', label: 'Requested', icon: AlertCircle },
  { key: 'approved', label: 'Approved', icon: FileText },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

function getStepIndex(status) {
  const map = { requested: 0, approved: 1, in_progress: 2, completed: 3 };
  return map[status] ?? 0;
}

function formatPriorityLabel(p) {
  if (!p) return '';
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export default function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTech, setSelectedTech] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [editingCost, setEditingCost] = useState(false);
  const [costValue, setCostValue] = useState('');
  const [savingCost, setSavingCost] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const fetchRequest = useCallback(async () => {
    try {
      const res = await maintenanceService.getById(id);
      const data = res?.data || res;
      setRequest(data);
      setCostValue(data?.actualCost || data?.cost || '');
    } catch {
      toast.error('Failed to load maintenance request');
      navigate('/maintenance');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await employeeService.getAll({ limit: 200 });
      const data = res?.data || res;
      setEmployees(Array.isArray(data) ? data : data?.employees || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAssign = async () => {
    if (!selectedTech) {
      toast.error('Please select a technician');
      return;
    }
    setAssigning(true);
    try {
      await maintenanceService.assign(id, selectedTech);
      toast.success('Technician assigned successfully');
      setShowAssignModal(false);
      setSelectedTech('');
      fetchRequest();
    } catch {
      toast.error('Failed to assign technician');
    } finally {
      setAssigning(false);
    }
  };

  const handleCostSave = async () => {
    setSavingCost(true);
    try {
      const numCost = parseFloat(costValue);
      if (isNaN(numCost) || numCost < 0) {
        toast.error('Please enter a valid cost');
        setSavingCost(false);
        return;
      }
      await maintenanceService.updateStatus(id, request.status);
      setEditingCost(false);
      toast.success('Cost updated successfully');
      fetchRequest();
    } catch {
      toast.error('Failed to update cost');
    } finally {
      setSavingCost(false);
    }
  };

  const handleStatusUpdate = async () => {
    const STATUS_FLOW = ['requested', 'approved', 'in_progress', 'completed'];
    const currentIdx = STATUS_FLOW.indexOf(request.status);
    if (currentIdx < 0 || currentIdx >= STATUS_FLOW.length - 1) return;

    const nextStatus = STATUS_FLOW[currentIdx + 1];
    setUpdatingStatus(true);
    try {
      await maintenanceService.updateStatus(id, nextStatus);
      toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
      setShowStatusConfirm(false);
      fetchRequest();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <LoadingSpinner centered />;

  if (!request) return null;

  const currentStep = getStepIndex(request.status);
  const nextStatuses = {
    requested: 'approved',
    approved: 'in_progress',
    in_progress: 'completed',
  };
  const nextStatusLabel = nextStatuses[request.status];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={request.title || 'Maintenance Request'}
        subtitle={`Asset: ${request.asset?.name || request.assetName || 'N/A'}`}
        icon={Wrench}
      >
        <button onClick={() => navigate('/maintenance')} className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Status Timeline</h3>
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900/30' : ''}`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCompleted
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Issue Description */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Issue Description</h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {request.description || request.notes || 'No description provided.'}
            </p>
          </div>

          {/* Activity Log */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" />
              Activity Log
            </h3>
            {request.activityLog && request.activityLog.length > 0 ? (
              <div className="space-y-4">
                {request.activityLog.map((log, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary-400" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{log.message || log.action}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(log.createdAt || log.date)}
                        {log.user ? ` - ${log.user}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h3>
              <StatusBadge status={request.status} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Priority</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                    request.priority
                  )}`}
                >
                  {formatPriorityLabel(request.priority)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {request.type || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-sm text-gray-900 dark:text-white">{formatDate(request.createdAt)}</span>
              </div>

              {request.scheduledDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Scheduled</span>
                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(request.scheduledDate)}</span>
                </div>
              )}

              {request.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(request.completedAt)}</span>
                </div>
              )}
            </div>

            {/* Cost */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Cost
                </span>
                {editingCost ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={costValue}
                      onChange={(e) => setCostValue(e.target.value)}
                      className="input w-24 text-sm py-1"
                      min="0"
                      step="0.01"
                    />
                    <button
                      onClick={handleCostSave}
                      disabled={savingCost}
                      className="p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCost(false);
                        setCostValue(request.actualCost || request.cost || '');
                      }}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingCost(true)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {formatCurrency(request.actualCost || request.cost || 0)}
                    <Edit3 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Assigned Technician */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Technician</span>
              </div>
              {request.assignedTechnician || request.assignedTo ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-medium">
                    {(request.assignedTechnician?.name || request.assignedTo || '')
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {request.assignedTechnician?.name || request.assignedTo}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Unassigned</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              {nextStatusLabel && (
                <button
                  onClick={() => setShowStatusConfirm(true)}
                  className="btn btn-primary w-full"
                >
                  Mark as {nextStatusLabel.replace('_', ' ')}
                </button>
              )}
              <button
                onClick={() => setShowAssignModal(true)}
                className="btn btn-secondary w-full"
              >
                {request.assignedTechnician || request.assignedTo ? 'Reassign Technician' : 'Assign Technician'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Technician Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Technician"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Select Technician</label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="input"
            >
              <option value="">Choose a technician...</option>
              {employees.map((emp) => (
                <option key={emp.id || emp._id} value={emp.id || emp._id}>
                  {emp.firstName} {emp.lastName} {emp.designation ? `(${emp.designation})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleAssign} disabled={assigning} className="btn btn-primary flex items-center gap-2">
              {assigning && <LoadingSpinner size="sm" />}
              Assign
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Update Confirm */}
      <ConfirmDialog
        isOpen={showStatusConfirm}
        title="Update Status"
        message={`Are you sure you want to change the status to "${nextStatusLabel?.replace('_', ' ')}"?`}
        confirmLabel="Update"
        onCancel={() => setShowStatusConfirm(false)}
        onConfirm={handleStatusUpdate}
        variant="info"
      />
    </motion.div>
  );
}
