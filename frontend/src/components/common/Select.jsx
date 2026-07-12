import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, X, Check } from 'lucide-react';

export default function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  isMulti = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      onChange?.(next);
    } else {
      onChange?.(optionValue);
      setOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(isMulti ? [] : null);
  };

  const selectedLabels = isMulti
    ? options.filter((o) => (Array.isArray(value) ? value : []).includes(o.value))
    : options.filter((o) => o.value === value);

  const displayText = isMulti
    ? selectedLabels.length > 0
      ? selectedLabels.map((o) => o.label).join(', ')
      : placeholder
    : selectedLabels[0]?.label || placeholder;

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            'input flex items-center justify-between text-left cursor-pointer',
            !selectedLabels.length && 'text-gray-400 dark:text-gray-500',
            error && 'border-red-500 focus:ring-red-500/20'
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className={clsx('h-4 w-4 flex-shrink-0 transition-transform', open && 'rotate-180')} />
        </button>

        {(value || (isMulti && Array.isArray(value) && value.length > 0)) && (
          <button
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">No options</div>
            ) : (
              options.map((option) => {
                const isSelected = isMulti
                  ? (Array.isArray(value) ? value : []).includes(option.value)
                  : value === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={clsx(
                      'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors',
                      isSelected
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {isMulti && (
                      <div
                        className={clsx(
                          'h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center',
                          isSelected
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    )}
                    <span className="truncate">{option.label}</span>
                    {!isMulti && isSelected && (
                      <Check className="h-4 w-4 ml-auto text-primary-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
