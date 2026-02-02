import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function Container({ children, size = "lg", className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${sizes[size]} px-4 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
