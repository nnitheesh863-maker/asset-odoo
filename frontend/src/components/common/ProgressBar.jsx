import { clsx } from 'clsx';

const colorMap = {
  blue: 'bg-primary-600',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export default function ProgressBar({ value = 0, color = 'blue', size = 'md', showLabel = false }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{clamped}%</span>
        </div>
      )}
      <div className={clsx('w-full rounded-full bg-gray-200 dark:bg-gray-700', sizeMap[size])}>
        <div
          className={clsx(
            'rounded-full transition-all duration-500 ease-out',
            colorMap[color] || colorMap.blue,
            sizeMap[size]
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
