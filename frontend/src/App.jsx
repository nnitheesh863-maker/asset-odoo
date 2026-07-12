import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'));
const DepartmentListPage = React.lazy(() => import('@/pages/organization/DepartmentListPage'));
const DepartmentDetailPage = React.lazy(() => import('@/pages/organization/DepartmentDetailPage'));
const EmployeeListPage = React.lazy(() => import('@/pages/organization/EmployeeListPage'));
const EmployeeDetailPage = React.lazy(() => import('@/pages/organization/EmployeeDetailPage'));
const CategoryListPage = React.lazy(() => import('@/pages/organization/CategoryListPage'));
const AssetListPage = React.lazy(() => import('@/pages/assets/AssetListPage'));
const AssetDetailPage = React.lazy(() => import('@/pages/assets/AssetDetailPage'));
const AssetCreatePage = React.lazy(() => import('@/pages/assets/AssetCreatePage'));
const AssetEditPage = React.lazy(() => import('@/pages/assets/AssetEditPage'));
const AllocationListPage = React.lazy(() => import('@/pages/allocation/AllocationListPage'));
const AllocationDetailPage = React.lazy(() => import('@/pages/allocation/AllocationDetailPage'));
const AllocationCreatePage = React.lazy(() => import('@/pages/allocation/AllocationCreatePage'));
const TransferListPage = React.lazy(() => import('@/pages/transfer/TransferListPage'));
const TransferDetailPage = React.lazy(() => import('@/pages/transfer/TransferDetailPage'));
const TransferCreatePage = React.lazy(() => import('@/pages/transfer/TransferCreatePage'));
const BookingListPage = React.lazy(() => import('@/pages/booking/BookingListPage'));
const BookingDetailPage = React.lazy(() => import('@/pages/booking/BookingDetailPage'));
const BookingCreatePage = React.lazy(() => import('@/pages/booking/BookingCreatePage'));
const BookingCalendarView = React.lazy(() => import('@/pages/booking/BookingCalendarView'));
const MaintenanceListPage = React.lazy(() => import('@/pages/maintenance/MaintenanceListPage'));
const MaintenanceDetailPage = React.lazy(() => import('@/pages/maintenance/MaintenanceDetailPage'));
const MaintenanceCreatePage = React.lazy(() => import('@/pages/maintenance/MaintenanceCreatePage'));
const AuditListPage = React.lazy(() => import('@/pages/audit/AuditListPage'));
const AuditDetailPage = React.lazy(() => import('@/pages/audit/AuditDetailPage'));
const AuditCreatePage = React.lazy(() => import('@/pages/audit/AuditCreatePage'));
const ReportsPage = React.lazy(() => import('@/pages/reports/ReportsPage'));
const AssetReportPage = React.lazy(() => import('@/pages/reports/AssetReportPage'));
const MaintenanceReportPage = React.lazy(() => import('@/pages/reports/MaintenanceReportPage'));
const AllocationReportPage = React.lazy(() => import('@/pages/reports/AllocationReportPage'));
const DepartmentReportPage = React.lazy(() => import('@/pages/reports/DepartmentReportPage'));
const CostReportPage = React.lazy(() => import('@/pages/reports/CostReportPage'));
const NotificationListPage = React.lazy(() => import('@/pages/notifications/NotificationListPage'));
const ProfilePage = React.lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage = React.lazy(() => import('@/pages/settings/SettingsPage'));

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/auth/*"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout />
          }
        >
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route index element={<Navigate to="login" replace />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Organization */}
          <Route path="departments" element={<DepartmentListPage />} />
          <Route path="departments/:id" element={<DepartmentDetailPage />} />
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="categories" element={<CategoryListPage />} />

          {/* Assets */}
          <Route path="assets" element={<AssetListPage />} />
          <Route path="assets/create" element={<AssetCreatePage />} />
          <Route path="assets/:id" element={<AssetDetailPage />} />
          <Route path="assets/:id/edit" element={<AssetEditPage />} />

          {/* Allocations */}
          <Route path="allocations" element={<AllocationListPage />} />
          <Route path="allocations/create" element={<AllocationCreatePage />} />
          <Route path="allocations/:id" element={<AllocationDetailPage />} />

          {/* Transfers */}
          <Route path="transfers" element={<TransferListPage />} />
          <Route path="transfers/create" element={<TransferCreatePage />} />
          <Route path="transfers/:id" element={<TransferDetailPage />} />

          {/* Bookings */}
          <Route path="bookings" element={<BookingListPage />} />
          <Route path="bookings/create" element={<BookingCreatePage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="bookings/calendar" element={<BookingCalendarView />} />

          {/* Maintenance */}
          <Route path="maintenance" element={<MaintenanceListPage />} />
          <Route path="maintenance/create" element={<MaintenanceCreatePage />} />
          <Route path="maintenance/:id" element={<MaintenanceDetailPage />} />

          {/* Audit */}
          <Route path="audit" element={<AuditListPage />} />
          <Route path="audit/create" element={<AuditCreatePage />} />
          <Route path="audit/:id" element={<AuditDetailPage />} />

          {/* Reports */}
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/assets" element={<AssetReportPage />} />
          <Route path="reports/maintenance" element={<MaintenanceReportPage />} />
          <Route path="reports/allocations" element={<AllocationReportPage />} />
          <Route path="reports/departments/:id" element={<DepartmentReportPage />} />
          <Route path="reports/costs" element={<CostReportPage />} />

          {/* Notifications */}
          <Route path="notifications" element={<NotificationListPage />} />

          {/* Profile & Settings */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Default redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch all */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
      </Routes>
    </React.Suspense>
  );
}

export default App;
