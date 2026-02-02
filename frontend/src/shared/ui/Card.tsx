import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-lg border border-brand-100/20 dark:bg-slate-800 dark:border-brand-900/30 dark:shadow-2xl ${
        hover ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-brand-200/40 dark:hover:border-brand-800/50" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 border-b border-slate-200 pb-4 dark:border-slate-700 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-lg font-bold text-slate-900 dark:text-white ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-slate-600 dark:text-slate-400 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-4 flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-700 ${className}`}>{children}</div>;
}
