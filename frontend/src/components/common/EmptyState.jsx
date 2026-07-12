import { clsx } from 'clsx';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={clsx('flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300/70 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/60', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-gradient-to-br from-blue-600/10 to-violet-600/10 p-4 text-blue-600 dark:text-blue-400">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary rounded-full">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
