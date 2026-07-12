import { Role } from '../types';

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'departments', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'employees', actions: ['view', 'create', 'edit', 'delete', 'assign_role'] },
    { resource: 'assets', actions: ['view', 'create', 'edit', 'delete', 'allocate', 'return'] },
    { resource: 'categories', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'transfers', actions: ['view', 'create', 'approve', 'reject'] },
    { resource: 'bookings', actions: ['view', 'create', 'approve', 'cancel'] },
    { resource: 'maintenance', actions: ['view', 'create', 'approve', 'reject', 'update_progress'] },
    { resource: 'audits', actions: ['view', 'create', 'edit'] },
    { resource: 'analytics', actions: ['view', 'export'] },
    { resource: 'notifications', actions: ['view', 'mark_read'] },
    { resource: 'activity_logs', actions: ['view'] },
    { resource: 'settings', actions: ['view', 'edit'] },
  ],
  ASSET_MANAGER: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'departments', actions: ['view'] },
    { resource: 'employees', actions: ['view'] },
    { resource: 'assets', actions: ['view', 'create', 'edit', 'delete', 'allocate', 'return'] },
    { resource: 'categories', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'transfers', actions: ['view', 'approve', 'reject'] },
    { resource: 'bookings', actions: ['view'] },
    { resource: 'maintenance', actions: ['view', 'approve', 'reject', 'update_progress'] },
    { resource: 'audits', actions: ['view', 'create', 'edit'] },
    { resource: 'analytics', actions: ['view'] },
    { resource: 'notifications', actions: ['view', 'mark_read'] },
    { resource: 'settings', actions: ['view', 'edit'] },
  ],
  DEPARTMENT_HEAD: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'departments', actions: ['view'] },
    { resource: 'employees', actions: ['view'] },
    { resource: 'assets', actions: ['view'] },
    { resource: 'transfers', actions: ['view', 'approve', 'reject'] },
    { resource: 'bookings', actions: ['view', 'create'] },
    { resource: 'maintenance', actions: ['view'] },
    { resource: 'analytics', actions: ['view'] },
    { resource: 'notifications', actions: ['view', 'mark_read'] },
    { resource: 'settings', actions: ['view', 'edit'] },
  ],
  EMPLOYEE: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'assets', actions: ['view'] },
    { resource: 'transfers', actions: ['view', 'create'] },
    { resource: 'bookings', actions: ['view', 'create'] },
    { resource: 'maintenance', actions: ['view', 'create'] },
    { resource: 'notifications', actions: ['view', 'mark_read'] },
    { resource: 'settings', actions: ['view', 'edit'] },
  ],
};

export function hasPermission(role: Role, resource: string, action: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  const resourcePerm = perms.find(p => p.resource === resource);
  return resourcePerm ? resourcePerm.actions.includes(action) : false;
}

export function canAccess(role: Role, resource: string): boolean {
  return hasPermission(role, resource, 'view');
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    ADMIN: 'Administrator',
    ASSET_MANAGER: 'Asset Manager',
    DEPARTMENT_HEAD: 'Department Head',
    EMPLOYEE: 'Employee',
  };
  return labels[role] || role;
}

export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    ADMIN: 'from-red-500 to-rose-500',
    ASSET_MANAGER: 'from-blue-500 to-cyan-500',
    DEPARTMENT_HEAD: 'from-purple-500 to-violet-500',
    EMPLOYEE: 'from-emerald-500 to-teal-500',
  };
  return colors[role] || 'from-gray-500 to-gray-600';
}

export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    ASSET_MANAGER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    DEPARTMENT_HEAD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    EMPLOYEE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  ADMIN: '/dashboard/admin',
  ASSET_MANAGER: '/dashboard/manager',
  DEPARTMENT_HEAD: '/dashboard/department',
  EMPLOYEE: '/dashboard/employee',
};
