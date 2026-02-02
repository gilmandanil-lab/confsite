import { ReactNode } from "react";

type Props = {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ label, required, error, hint, children }: Props) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <span className="font-semibold">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
        {hint ? <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{hint}</span> : null}
      </div>
      {children}
      {error ? <div className="rounded-md bg-red-50 p-2 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</div> : null}
    </label>
  );
}
