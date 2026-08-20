import React from 'react';
import { Search, Inbox } from 'lucide-react';

export const Table = ({
  columns = [],
  data = [],
  searchValue = '',
  onSearchChange = null,
  searchPlaceholder = 'Search records...',
  emptyMessage = 'No records found',
  emptySubtext = 'Try adjusting your search query or filters.',
  actions = null,
}) => {
  return (
    <div className="w-full bg-rose-50/80 border border-white rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
      {/* Table Top Controls */}
      {(onSearchChange || actions) && (
        <div className="p-4 sm:p-5 border-b border-white/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-rose-50/60 border border-white rounded-xl text-sm text-slate-700 placeholder-rose-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-rose-50/70 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 sm:px-6 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60">
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  className="hover:bg-white/40 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-4 px-4 sm:px-6 ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <div className="p-3 bg-white/60 rounded-2xl border border-rose-100/50 text-rose-300">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <p className="text-base font-semibold text-slate-600">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-rose-300">{emptySubtext}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
