import { ReactNode } from "react";

type Column<T> = {
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  getKey?: (row: T) => string;
  empty: string;
};

export function DataTable<T>({ rows, columns, getKey, empty }: Props<T>) {
  if (!rows.length) {
    return <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700">{empty}</div>;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900/40">
          {rows.map((row, idx) => (
            <tr key={getKey ? getKey(row) : idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 text-sm text-slate-800 dark:text-slate-100 ${col.className || ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
