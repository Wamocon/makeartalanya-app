"use client";

import Link from "next/link";
import { useAdminLocale } from "@/components/admin/AdminLocaleProvider";
import AdminLogout from "./AdminLogout";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type Props = {
  totalCount: number;
  pendingCount: number;
  confirmedCount: number;
  cancelledCount: number;
  completedCount: number;
};

// Each card drills into the registrations list, pre-filtered to the status it
// counts — the numbers were previously a dead end.
const metrics = [
  { key: "total", labelKey: "totalBookings", subKey: "allTime", color: "gray", icon: Users, href: "/admin/registrations" },
  { key: "pending", labelKey: "pending", subKey: "ofTotal", color: "amber", icon: AlertCircle, href: "/admin/registrations?status=new" },
  { key: "confirmed", labelKey: "confirmed", subKey: "completed", color: "emerald", icon: CheckCircle, href: "/admin/registrations?status=enrolled" },
  { key: "cancelled", labelKey: "cancelled", subKey: "cancelRate", color: "rose", icon: XCircle, href: "/admin/registrations?status=archived" },
] as const;

export default function DashboardHeader({
  totalCount,
  pendingCount,
  confirmedCount,
  cancelledCount,
  completedCount,
}: Props) {
  const { t, locale } = useAdminLocale();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greeting.morning : hour < 18 ? t.greeting.afternoon : t.greeting.evening;
  const dateLocale = locale === "tr" ? "tr-TR" : locale === "ru" ? "ru-RU" : "en-US";

  const counts = { total: totalCount, pending: pendingCount, confirmed: confirmedCount, cancelled: cancelledCount, completed: completedCount };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString(dateLocale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-full hover:bg-white hover:shadow-sm transition-all"
          >
            {t.viewSite} ↗
          </Link>
          <AdminLogout label={t.signOut} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ key, labelKey, subKey, color, icon: Icon, href }) => {
          const count = counts[key as keyof typeof counts];
          const percent = totalCount > 0 && key !== "total" ? Math.round((count / totalCount) * 100) : 0;

          const colorMap: Record<string, { bg: string; border: string; text: string; sub: string; iconBg: string; icon: string; gradient: string }> = {
            gray: { bg: "bg-white", border: "border-[var(--border)]", text: "text-[var(--foreground)]", sub: "text-[var(--muted)]", iconBg: "bg-[var(--pink-light)]", icon: "text-[var(--pink-dark)]", gradient: "from-[var(--pink-light)] to-transparent" },
            amber: { bg: "bg-amber-50/70", border: "border-amber-100", text: "text-amber-700", sub: "text-amber-500", iconBg: "bg-amber-100", icon: "text-amber-600", gradient: "from-amber-100/50 to-transparent" },
            emerald: { bg: "bg-emerald-50/70", border: "border-emerald-100", text: "text-emerald-700", sub: "text-emerald-500", iconBg: "bg-emerald-100", icon: "text-emerald-600", gradient: "from-emerald-100/50 to-transparent" },
            rose: { bg: "bg-rose-50/70", border: "border-rose-100", text: "text-rose-700", sub: "text-rose-500", iconBg: "bg-rose-100", icon: "text-rose-600", gradient: "from-rose-100/50 to-transparent" },
          };
          const c = colorMap[color];

          return (
            <Link
              key={key}
              href={href}
              aria-label={`${(t.metrics as Record<string, string>)[labelKey]}: ${count}`}
              className={`relative block overflow-hidden ${c.bg} rounded-2xl border ${c.border} p-5 card-hover group transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink)] focus-visible:ring-offset-2`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${c.gradient} rounded-full blur-2xl opacity-60`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${c.sub}`}>
                    {(t.metrics as Record<string, string>)[labelKey]}
                  </p>
                  <p className={`text-3xl font-bold ${c.text}`}>{count}</p>
                  <p className={`text-[11px] mt-1 ${c.sub}`}>
                    {key === "confirmed" && `${completedCount} ${t.metrics.completed}`}
                    {key === "pending" && `${percent}% ${t.metrics.ofTotal}`}
                    {key === "cancelled" && `${percent}% ${t.metrics.cancelRate}`}
                    {key === "total" && t.metrics.allTime}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.iconBg} ${c.icon} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
