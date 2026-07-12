import { useState } from 'react';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={clsx(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
        )}
      >
        <TopBar onMenuToggle={() => setMobileOpen((o) => !o)} />

        <main className="p-4 lg:p-6 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}
