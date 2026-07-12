import { useState, createContext } from 'react';
import { NavLink } from 'react-router-dom';
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
    items: [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }],
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
    items: [{ label: 'Reports', path: '/reports', icon: BarChart3 }],
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
    <div className="flex h-full flex-col">
      <div className={clsx('border-b border-slate-200/70 px-4 py-5 dark:border-slate-800/80', collapsed && 'justify-center px-2')}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20">
            <span className="text-sm font-semibold text-white">AF</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">AssetFlow</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Operations suite</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {menuSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
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
                      'sidebar-link rounded-2xl border border-transparent',
                      isActive ? 'sidebar-link-active shadow-sm' : 'sidebar-link-inactive',
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

      <div className="border-t border-slate-200/70 p-3 dark:border-slate-800/80">
        <button
          onClick={toggleDarkMode}
          className={clsx(
            'sidebar-link sidebar-link-inactive mb-2 w-full rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/70',
            collapsed && 'justify-center px-2'
          )}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <div className={clsx('flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-2.5 dark:border-slate-800/80 dark:bg-slate-900/70', collapsed && 'justify-center')}>
          <Avatar name="John Doe" size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">John Doe</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200/70 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/70 lg:flex',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {sidebarContent}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg shadow-slate-200/70 transition hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:shadow-slate-950/50"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 lg:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
