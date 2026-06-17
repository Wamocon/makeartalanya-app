"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  title?: string;
};

const variantStyles = {
  primary: "bg-[var(--foreground)] text-white hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
  gradient: "bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] text-white hover:shadow-[var(--shadow-pink)] hover:-translate-y-0.5",
  secondary: "bg-white text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--pink-dark)]/40 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
  ghost: "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--pink-light)]",
  danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading,
  className = "",
  disabled,
  type = "button",
  onClick,
  title,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      title={title}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center rounded-xl font-semibold
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
