import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Filter,
  Eye,
  EyeOff,
  Inbox,
} from 'lucide-react';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import SearchInput from '../common/SearchInput';

export default function DataTable({
  columns = [],
  data = [],
  searchable = false,
  filterable = false,
  exportable = false,
  onRowClick,
  loading = false,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState(() => columns.map((c) => c.key));
  const [showColumnToggle, setShowColumnToggle] = useState(false);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, sortKey, sortDir, columns]);

  const activeColumns = columns.filter((c) => visibleColumns.includes(c.key));

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleColumn = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleExport = () => {
    const headers = activeColumns.map((c) => c.label).join(',');
    const rows = filteredData.map((row) =>
      activeColumns.map((c) => {
        const val = row[c.key];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val ?? '';
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <LoadingSkeleton variant="table" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(searchable || filterable || exportable) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {searchable && (
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search table..."
              className="w-full sm:w-64"
            />
          )}
          <div className="flex items-center gap-2 ml-auto">
            {filterable && (
              <div className="relative">
                <button
                  onClick={() => setShowColumnToggle((s) => !s)}
                  className="btn btn-secondary btn-sm"
                >
                  <Eye className="h-4 w-4" />
                  Columns
                </button>
                {showColumnToggle && (
                  <div className="absolute right-0 mt-1 z-50 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
                    {columns.map((col) => (
                      <button
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {visibleColumns.includes(col.key) ? (
                          <Eye className="h-3.5 w-3.5 text-primary-600" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                        )}
                        {col.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {exportable && (
              <button onClick={handleExport} className="btn btn-secondary btn-sm">
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="table-header border-b border-gray-200 dark:border-gray-700">
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'table-cell text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-white'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="text-gray-400">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length}>
                  <EmptyState icon={Inbox} title="No data found" />
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={clsx(
                    'transition-colors',
                    onRowClick && 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                  )}
                >
                  {activeColumns.map((col) => (
                    <td key={col.key} className="table-cell">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
