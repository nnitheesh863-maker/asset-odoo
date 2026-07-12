import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Package, FolderTree, ArrowLeftRight,
  Wrench, CalendarClock, Bell, Activity, BarChart3, Settings, Menu, X,
  ClipboardList, ChevronDown, ChevronRight, Layers, LogOut, Shield,
  PackageCheck, UserCog, Headphones
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel, getRoleBadgeColor } from '../../utils/permissions';
import { Role } from '../../types';

type NavItem = 
  | { section: string; icon?: never; label?: never; path?: never; badge?: never }
  | { icon: any; label: string; path: string; badge?: string; section?: never };

function getNavItems(role: Role): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return [
        { section: 'Overview' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { section: 'Organization' },
        { icon: Building2, label: 'Departments', path: '/departments' },
        { icon: Users, label: 'Employees', path: '/employees' },
        { icon: UserCog, label: 'Role Management', path: '/employees' },
        { section: 'Assets' },
        { icon: Package, label: 'All Assets', path: '/assets' },
        { icon: FolderTree, label: 'Categories', path: '/categories' },
        { icon: ArrowLeftRight, label: 'Transfers', path: '/transfers' },
        { section: 'Operations' },
        { icon: CalendarClock, label: 'Bookings', path: '/bookings' },
        { icon: Wrench, label: 'Maintenance', path: '/maintenance' },
        { icon: ClipboardList, label: 'Audit Cycles', path: '/audits' },
        { section: 'Intelligence' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Activity, label: 'Activity Logs', path: '/activity-logs' },
        { section: 'System' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];

    case 'ASSET_MANAGER':
      return [
        { section: 'Overview' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { section: 'Assets' },
        { icon: Package, label: 'All Assets', path: '/assets' },
        { icon: FolderTree, label: 'Categories', path: '/categories' },
        { icon: PackageCheck, label: 'Allocate Assets', path: '/assets' },
        { section: 'Approvals' },
        { icon: ArrowLeftRight, label: 'Transfer Requests', path: '/transfers' },
        { icon: Wrench, label: 'Maintenance Requests', path: '/maintenance' },
        { section: 'Operations' },
        { icon: ClipboardList, label: 'Audit Cycles', path: '/audits' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { section: 'People' },
        { icon: Users, label: 'Employees', path: '/employees' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];

    case 'DEPARTMENT_HEAD':
      return [
        { section: 'Overview' },
        { icon: LayoutDashboard, label: 'Department Dashboard', path: '/dashboard' },
        { section: 'Department' },
        { icon: Package, label: 'Department Assets', path: '/assets' },
        { icon: Users, label: 'Department Employees', path: '/employees' },
        { section: 'Approvals' },
        { icon: ArrowLeftRight, label: 'Transfer Requests', path: '/transfers' },
        { section: 'Operations' },
        { icon: CalendarClock, label: 'Resource Bookings', path: '/bookings' },
        { icon: BarChart3, label: 'Department Reports', path: '/analytics' },
        { section: 'System' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];

    case 'EMPLOYEE':
      return [
        { section: 'Overview' },
        { icon: LayoutDashboard, label: 'My Dashboard', path: '/dashboard' },
        { section: 'My Assets' },
        { icon: Package, label: 'My Assets', path: '/assets' },
        { icon: CalendarClock, label: 'My Bookings', path: '/bookings' },
        { section: 'Requests' },
        { icon: Wrench, label: 'Maintenance Requests', path: '/maintenance' },
        { icon: ArrowLeftRight, label: 'Transfer Requests', path: '/transfers' },
        { section: 'System' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];

    default:
      return [];
  }
}

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'EMPLOYEE';
  const navItems = getNavItems(role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'} bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col`}>
      {/* Logo Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <Layers size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">AssetFlow</span>
          </div>
        )}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/50">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${getRoleBadgeColor(role)}`}>
            <Shield size={12} />
            <span className="text-xs font-semibold">{getRoleLabel(role)}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {navItems.map((item, index) => {
          if (item.section) {
            if (collapsed) return null;
            return (
              <div key={`section-${index}`} className="pt-4 pb-1.5 px-3">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.section}</span>
              </div>
            );
          }

          if (!('path' in item) || !item.path) return null;
          const navItem = item as { icon: any; label: string; path: string; badge?: string };
          const isActive = location.pathname === navItem.path;
          return (
            <NavLink
              key={`${navItem.path}-${index}`}
              to={navItem.path}
              title={collapsed ? navItem.label : undefined}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <navItem.icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'} />
              {!collapsed && <span className="flex-1">{navItem.label}</span>}
              {!collapsed && navItem.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{navItem.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      {!collapsed && user && (
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.employeeId} • {user.department?.name || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
