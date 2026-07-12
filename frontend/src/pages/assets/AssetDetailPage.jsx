import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Package,
  ArrowLeft,
  Edit,
  RefreshCw,
  Truck,
  Wrench,
  Printer,
  QrCode,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Building2,
  Tag,
  Hash,
  Clock,
  CheckCircle,
  Download,
} from 'lucide-react';
import assetService from '@/services/assetService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import Tabs from '@/components/common/Tabs';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [qrCode, setQrCode] = useState(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  useEffect(() => {
    const loadAsset = async () => {
      setLoading(true);
      try {
        const [assetRes, timelineRes] = await Promise.all([
          assetService.getById(id),
          assetService.getTimeline(id).catch(() => ({ data: [] })),
        ]);
        setAsset(assetRes.data || assetRes);
        const tl = timelineRes.data?.timeline || timelineRes.data || timelineRes.timeline || [];
        setTimeline(Array.isArray(tl) ? tl : []);
      } catch {
        toast.error('Failed to load asset details');
        navigate('/assets');
      } finally {
        setLoading(false);
      }
    };
    loadAsset();
  }, [id, navigate]);

  const handleDownloadQR = async () => {
    try {
      const blob = await assetService.getQRCode(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `asset-${asset.assetTag || asset.id}-qr.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded');
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  if (loading) return <LoadingSpinner centered />;
  if (!asset) return null;

  const infoItems = [
    { label: 'Asset Code', value: asset.assetTag || asset.assetCode, icon: Tag },
    { label: 'Serial Number', value: asset.serialNumber, icon: Hash },
    { label: 'Category', value: asset.category?.name, icon: Package },
    { label: 'Purchase Date', value: formatDate(asset.purchaseDate), icon: Calendar },
    {
      label: 'Purchase Price',
      value: asset.purchasePrice ? formatCurrency(asset.purchasePrice) : null,
      icon: DollarSign,
    },
    { label: 'Current Value', value: asset.currentValue ? formatCurrency(asset.currentValue) : null, icon: DollarSign },
    { label: 'Location', value: asset.location, icon: MapPin },
    { label: 'Condition', value: asset.condition, icon: Package },
    { label: 'Warranty Expiry', value: formatDate(asset.warrantyExpiry), icon: Calendar },
    { label: 'Department', value: asset.department?.name, icon: Building2 },
    {
      label: 'Assigned To',
      value: asset.assignedTo
        ? `${asset.assignedTo.firstName || ''} ${asset.assignedTo.lastName || ''}`
        : null,
      icon: User,
    },
  ].filter((item) => item.value);

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'maintenance', label: 'Maintenance History' },
    { key: 'allocation', label: 'Allocation History' },
  ];

  const maintenanceHistory = timeline.filter(
    (t) => t.type === 'maintenance' || t.action === 'maintenance'
  );
  const allocationHistory = timeline.filter(
    (t) => t.type === 'allocation' || t.action === 'allocated' || t.action === 'returned'
  );

  return (
    <div>
      <PageHeader
        title={asset.name}
        subtitle={asset.assetTag || asset.assetCode}
        icon={Package}
      >
        <button onClick={() => navigate('/assets')} className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={() => navigate(`/assets/${id}/edit`)}
          className="btn btn-secondary"
        >
          <Edit className="h-4 w-4" /> Edit
        </button>
        <button
          onClick={() => navigate(`/allocations/new?assetId=${id}`)}
          className="btn btn-primary"
        >
          <RefreshCw className="h-4 w-4" /> Allocate
        </button>
        <button
          onClick={() => navigate(`/transfers/new?assetId=${id}`)}
          className="btn btn-primary"
        >
          <Truck className="h-4 w-4" /> Transfer
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-start gap-4">
              {asset.imageUrl || asset.image ? (
                <img
                  src={asset.imageUrl || asset.image}
                  alt={asset.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <StatusBadge status={asset.status} />
                  {asset.condition && <StatusBadge status={asset.condition} />}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {asset.description || 'No description'}
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Asset Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Asset Timeline
              </h3>
              {timeline.length === 0 ? (
                <EmptyState icon={Clock} title="No timeline events" description="Activity will appear here" />
              ) : (
                <div className="space-y-4">
                  {timeline.map((event, idx) => (
                    <div key={event.id || idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          event.action === 'allocated'
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : event.action === 'returned'
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : event.action === 'maintenance'
                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                : event.action === 'transferred'
                                  ? 'bg-purple-100 dark:bg-purple-900/30'
                                  : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {event.action === 'allocated' ? (
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : event.action === 'returned' ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : event.action === 'maintenance' ? (
                            <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          ) : event.action === 'transferred' ? (
                            <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        {idx < timeline.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title || event.action || 'Activity'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {event.description || event.details || ''}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(event.createdAt || event.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Maintenance History
              </h3>
              {maintenanceHistory.length === 0 ? (
                <EmptyState icon={Wrench} title="No maintenance records" description="Maintenance history will appear here" />
              ) : (
                <div className="space-y-3">
                  {maintenanceHistory.map((record, idx) => (
                    <div key={record.id || idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <Wrench className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.title || record.details}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(record.createdAt || record.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'allocation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Allocation History
              </h3>
              {allocationHistory.length === 0 ? (
                <EmptyState icon={User} title="No allocation records" description="Allocation history will appear here" />
              ) : (
                <div className="space-y-3">
                  {allocationHistory.map((record, idx) => (
                    <div key={record.id || idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <User className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.title || record.action || 'Allocation'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {record.description || record.details || ''}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(record.createdAt || record.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              QR Code
            </h3>
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">QR Code</p>
                  </div>
                )}
              </div>
              <button onClick={handleDownloadQR} className="btn btn-secondary w-full">
                <Download className="h-4 w-4" /> Download QR Code
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/assets/${id}/edit`)}
                className="btn btn-secondary w-full justify-start"
              >
                <Edit className="h-4 w-4" /> Edit Asset
              </button>
              <button
                onClick={() => navigate(`/allocations/new?assetId=${id}`)}
                className="btn btn-secondary w-full justify-start"
              >
                <RefreshCw className="h-4 w-4" /> Create Allocation
              </button>
              <button
                onClick={() => navigate(`/transfers/new?assetId=${id}`)}
                className="btn btn-secondary w-full justify-start"
              >
                <Truck className="h-4 w-4" /> Request Transfer
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary w-full justify-start"
              >
                <Printer className="h-4 w-4" /> Print Details
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
