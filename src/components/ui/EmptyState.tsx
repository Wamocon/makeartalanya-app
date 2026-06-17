import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-[var(--border)]">
      <div className="w-14 h-14 rounded-2xl bg-[var(--pink-light)] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[var(--pink-dark)]" />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-xs mx-auto px-4">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
