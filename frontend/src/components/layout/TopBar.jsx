import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { Menu, Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import SearchInput from '../common/SearchInput';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';
import Breadcrumb from '../common/Breadcrumb';

function pathToBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const items = [{ label: 'Home', path: '/dashboard' }];
  let path = '';
  segments.forEach((seg) => {
    path += `/${seg}`;
    items.push({
      label: seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      path,
    });
  });
  return items;
}

export default function TopBar({ onMenuToggle }) {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const breadcrumbItems = pathToBreadcrumbs(location.pathname);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:block">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:block w-64">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search assets..."
          debounceMs={400}
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
      </button>

      {/* User dropdown */}
      <Dropdown
        trigger={
          <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Avatar name="John Doe" size="sm" />
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              John
            </span>
            <ChevronDown className="hidden md:block h-4 w-4 text-gray-400" />
          </button>
        }
      >
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">john@assetflow.com</p>
        </div>
        <button className="dropdown-item">
          <User className="h-4 w-4" />
          Profile
        </button>
        <button className="dropdown-item">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
          <button className="dropdown-item text-red-600 dark:text-red-400">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </Dropdown>
    </header>
  );
}
