import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (() => {
      let timer;
      return (val) => {
        clearTimeout(timer);
        timer = setTimeout(() => onChange?.(val), debounceMs);
      };
    })(),
    [onChange, debounceMs]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    debouncedOnChange(val);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
  };

  return (
    <div className={clsx('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="input h-10 rounded-full border-slate-200 bg-white/90 pl-10 pr-9 shadow-sm transition focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900/80"
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
