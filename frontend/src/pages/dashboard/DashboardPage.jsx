import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner centered size="lg" />;
  }

  const role = user?.role?.toLowerCase();

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'manager') {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
}
