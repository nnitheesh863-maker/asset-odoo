import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Role-based Dashboard
import RoleDashboard from './pages/RoleDashboard';

// Shared Pages (accessible by multiple roles)
import DepartmentsPage from './pages/admin/DepartmentsPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import AssetsPage from './pages/admin/AssetsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import TransfersPage from './pages/admin/TransfersPage';
import BookingsPage from './pages/admin/BookingsPage';
import MaintenancePage from './pages/admin/MaintenancePage';
import NotificationsPage from './pages/admin/NotificationsPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9' } }} />
          <Routes>
            {/* ============ PUBLIC ROUTES ============ */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* ============ PROTECTED ROUTES ============ */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard — Role-specific rendering */}
              <Route path="dashboard" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']}>
                  <RoleDashboard />
                </ProtectedRoute>
              } />

              {/* Settings — All authenticated users */}
              <Route path="settings" element={<SettingsPage />} />

              {/* ============ ORGANIZATION SETUP (Admin Only) ============ */}
              <Route path="departments" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER']}>
                  <DepartmentsPage />
                </ProtectedRoute>
              } />

              <Route path="employees" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']}>
                  <EmployeesPage />
                </ProtectedRoute>
              } />

              {/* ============ ASSETS ============ */}
              <Route path="assets" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']}>
                  <AssetsPage />
                </ProtectedRoute>
              } />

              <Route path="categories" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER']}>
                  <CategoriesPage />
                </ProtectedRoute>
              } />

              {/* ============ OPERATIONS ============ */}
              <Route path="transfers" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']}>
                  <TransfersPage />
                </ProtectedRoute>
              } />

              <Route path="bookings" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']}>
                  <BookingsPage />
                </ProtectedRoute>
              } />

              <Route path="maintenance" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']}>
                  <MaintenancePage />
                </ProtectedRoute>
              } />

              {/* ============ ANALYTICS (Admin & Dept Head) ============ */}
              <Route path="analytics" element={
                <ProtectedRoute roles={['ADMIN', 'DEPARTMENT_HEAD']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />

              {/* ============ AUDIT CYCLES (Admin & Asset Manager) ============ */}
              <Route path="audits" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />

              {/* ============ SYSTEM ============ */}
              <Route path="notifications" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']}>
                  <NotificationsPage />
                </ProtectedRoute>
              } />

              <Route path="activity-logs" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <ActivityLogsPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
