import { Package, Sparkles } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,_#2563eb_0%,_#4f46e5_45%,_#0f172a_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.34)_0%,_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.2)_0%,_transparent_32%)]" />
        <div className="absolute left-10 top-12 h-24 w-24 rounded-full border border-white/20" />
        <div className="absolute bottom-16 right-14 h-36 w-36 rounded-full border border-white/20" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md shadow-lg">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">AssetFlow</h1>
          <p className="mt-1 text-sm text-blue-100">Enterprise Asset Management</p>
        </div>

        <div className="rounded-[28px] border border-white/20 bg-white/95 p-7 shadow-2xl shadow-slate-950/20 backdrop-blur-xl dark:bg-slate-900/90">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Sparkles className="h-4 w-4 text-primary-600" />
            Secure and streamlined access
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
