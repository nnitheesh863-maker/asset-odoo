import { clsx } from 'clsx';

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon: Icon,
  children,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-xl bg-primary-100 dark:bg-primary-900/30 p-2.5">
            <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {actionLabel && onAction && (
          <button onClick={onAction} className="btn btn-primary">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
