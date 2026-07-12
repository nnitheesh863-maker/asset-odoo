import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export default function LoadingSpinner({ size = 'md', centered = false, className }) {
  const spinner = (
    <Loader2
      className={clsx('animate-spin text-primary-600 dark:text-primary-400', sizes[size], className)}
    />
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center py-12">
        {spinner}
      </div>
    );
  }

  return spinner;
}
