import { clsx } from 'clsx';
import { Calendar } from 'lucide-react';

export default function DateRangePicker({ startDate, endDate, onChange, label }) {
  const handleChange = (field, value) => {
    onChange?.({
      startDate: field === 'startDate' ? value : startDate,
      endDate: field === 'endDate' ? value : endDate,
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="input pl-10"
          />
        </div>
        <span className="text-gray-400 text-sm">to</span>
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>
    </div>
  );
}
