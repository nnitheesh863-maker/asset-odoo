import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, User, Settings, LogOut, ChevronDown, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-xl border border-slate-200/70 bg-white/80 p-2 text-slate-500 transition hover:text-slate-700 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 md:flex">
            <Sparkles className="h-4 w-4" />
            Live operations
          </div>

          <div className="hidden w-64 md:block">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search assets..."
              debounceMs={400}
            />
          </div>

          <button className="relative rounded-xl border border-slate-200/70 bg-white/80 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>

          <Dropdown
            trigger={
              <button className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 p-1.5 transition hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:bg-slate-800">
                <Avatar name="John Doe" size="sm" />
                <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 md:block">John</span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
              </button>
            }
          >
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">John Doe</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">john@assetflow.com</p>
            </div>
            <button className="dropdown-item">
              <User className="h-4 w-4" />
              Profile
            </button>
            <button className="dropdown-item">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-800">
              <button className="dropdown-item text-red-600 dark:text-red-400">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
