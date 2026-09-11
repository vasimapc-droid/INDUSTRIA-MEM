import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  pageSize = 10,
  emptyMessage = 'No data',
  onRowClick
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              {columns.map(col => (
                <th key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={'text-left px-4 py-3 ' + (col.sortable !== false ? 'cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700' : '')}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc'
                      ? <ChevronUp size={14} />
                      : <ChevronDown size={14} />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={row.id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={'border-t border-slate-200 dark:border-slate-800 ' +
                  (onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : '')}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {!paged.length && (
              <tr><td colSpan={columns.length} className="text-center py-10 text-slate-500">{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400 px-3">
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}