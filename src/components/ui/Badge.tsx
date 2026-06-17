interface BadgeProps {
  children: React.ReactNode;
  variant?: "pink" | "blue" | "green" | "amber" | "gray";
  dot?: boolean;
}

const variants = {
  pink: "bg-[var(--pink-light)] text-[var(--pink-dark)] border-[var(--pink)]/20",
  blue: "bg-[var(--blue-light)] text-[var(--blue-dark)] border-[var(--blue)]/20",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  gray: "bg-[#F5F5F5] text-[var(--muted)] border-[var(--border)]",
};

export default function Badge({ children, variant = "pink", dot }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
        ${variants[variant]}
      `}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}
