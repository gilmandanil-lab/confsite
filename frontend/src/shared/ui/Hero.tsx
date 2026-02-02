import { ReactNode } from "react";

interface HeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Hero({ title, subtitle, action, children, className = "" }: HeroProps) {
  return (
    <div className={`relative overflow-hidden px-4 py-16 lg:px-8 lg:py-24 ${className}`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-400 rounded-full blur-3xl opacity-10 dark:opacity-5"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-10 dark:opacity-5"></div>
      </div>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 sm:text-xl">
            {subtitle}
          </p>
        )}
        {action && (
          <div className="mt-8 flex flex-wrap gap-4">
            {action}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
