import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export default function Card({ children, className = "", hover = false, glass = false }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border transition-all duration-200
        ${glass
          ? "glass shadow-[var(--shadow-lg)]"
          : "bg-white border-[var(--border)] shadow-[var(--shadow-sm)]"
        }
        ${hover ? "hover:shadow-[var(--shadow-md)] hover:border-[var(--pink)]/20 hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
