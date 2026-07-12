export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon: Icon,
  children,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-2xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 p-2.5 text-blue-600 dark:text-blue-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="page-title text-xl">{title}</h1>
          {subtitle && <p className="page-subtitle mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {actionLabel && onAction && (
          <button onClick={onAction} className="btn btn-primary rounded-full">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
