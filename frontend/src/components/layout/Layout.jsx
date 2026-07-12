import { useState } from 'react';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(135deg,_#f8fbff_0%,_#f3f6ff_45%,_#eef2ff_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_40%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-[-8%] top-10 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={clsx(
          'relative transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
        )}
      >
        <TopBar onMenuToggle={() => setMobileOpen((o) => !o)} />

        <main className="px-3 pb-6 pt-4 lg:px-6 lg:pt-6">
          <div className="app-shell mx-auto max-w-7xl p-3 sm:p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
