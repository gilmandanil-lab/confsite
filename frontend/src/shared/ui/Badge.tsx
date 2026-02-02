import { ReactNode } from "react";

interface BadgeProps {
  variant?: "primary" | "success" | "warning" | "error" | "info";
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<Exclude<BadgeProps["variant"], undefined>, string> = {
  primary: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  error: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

export function Badge({ variant = "primary", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
