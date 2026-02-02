import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
}

export function Input({ error, hint, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        className={`rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-normal text-slate-900 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
