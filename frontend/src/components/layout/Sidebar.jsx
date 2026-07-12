import { useState, createContext, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Wrench,
  ClipboardList,
  Calendar,
  BarChart3,
  Settings,
  Users,
  Shield,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Moon,
  Boxes,
  MapPin,
} from 'lucide-react';
import Avatar from '../common/Avatar';

const SidebarContext = createContext();

const menuSections = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Asset Management',
    items: [
      { label: 'Assets', path: '/assets', icon: Package },
      { label: 'Categories', path: '/categories', icon: Boxes },
      { label: 'Locations', path: '/locations', icon: MapPin },
    ],
  },
  {
    label: 'Maintenance',
    items: [
      { label: 'Work Orders', path: '/work-orders', icon: ClipboardList },
      { label: 'Preventive', path: '/preventive-maintenance', icon: Calendar },
      { label: 'Inventory', path: '/inventory', icon: Wrench },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Reports', path: '/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', path: '/users', icon: Users },
      { label: 'Roles', path: '/roles', icon: Shield },
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={clsx('flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-700', collapsed && 'justify-center px-2')}>
        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AF</span>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
            AssetFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    clsx(
                      'sidebar-link',
                      isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
                      collapsed && 'justify-center px-2'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Dark mode toggle & user */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
        <button
          onClick={toggleDarkMode}
          className={clsx(
            'sidebar-link sidebar-link-inactive w-full',
            collapsed && 'justify-center px-2'
          )}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <div className={clsx('flex items-center gap-3 rounded-lg p-2', collapsed && 'justify-center')}>
          <Avatar name="John Doe" size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {sidebarContent}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 lg:hidden shadow-xl"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
