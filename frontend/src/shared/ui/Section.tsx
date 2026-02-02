import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  noPadding?: boolean;
}

export function Section({ children, className = "", id, noPadding = false }: SectionProps) {
  return (
    <section id={id} className={`relative ${!noPadding ? "py-12 lg:py-16" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeader({ title, subtitle, className = "" }: { title: ReactNode; subtitle?: ReactNode; className?: string }) {
  return (
    <div className={`mb-8 text-center lg:mb-12 ${className}`}>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
