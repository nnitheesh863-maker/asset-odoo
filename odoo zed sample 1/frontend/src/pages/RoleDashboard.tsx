import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Role-specific dashboards
import AdminDashboard from './admin/AdminDashboard';
import ManagerDashboard from './manager/ManagerDashboard';
import DepartmentDashboard from './department/DepartmentDashboard';
import EmployeeDashboard from './employee/EmployeeDashboard';

export default function RoleDashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'ASSET_MANAGER':
      return <ManagerDashboard />;
    case 'DEPARTMENT_HEAD':
      return <DepartmentDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}
