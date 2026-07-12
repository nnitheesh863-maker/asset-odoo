import { clsx } from 'clsx';

const variants = {
  text: 'h-4 rounded w-full',
  title: 'h-6 rounded w-1/3',
  card: 'h-32 rounded-xl w-full',
  table: 'h-10 rounded w-full',
  avatar: 'h-10 w-10 rounded-full',
  chart: 'h-64 rounded-xl w-full',
};

function SkeletonLine({ className }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  );
}

export default function LoadingSkeleton({
  variant = 'text',
  rows = 1,
  className,
}) {
  if (variant === 'card') {
    return (
      <div className={clsx('space-y-4', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <SkeletonLine className="h-5 w-1/4" />
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={clsx('space-y-2', className)}>
        <SkeletonLine className="h-12 rounded-lg w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} className="h-14 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} className={variants[variant] || variants.text} />
      ))}
    </div>
  );
}
