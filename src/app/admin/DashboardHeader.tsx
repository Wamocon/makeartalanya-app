"use client";

import Link from "next/link";
import { useAdminLocale } from "@/components/admin/AdminLocaleProvider";
import AdminLogout from "./AdminLogout";

type Props = {
  totalCount: number;
  pendingCount: number;
  confirmedCount: number;
  cancelledCount: number;
  completedCount: number;
};

export default function DashboardHeader({ totalCount, pendingCount, confirmedCount, cancelledCount, completedCount }: Props) {
  const { t, locale } = useAdminLocale();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greeting.morning : hour < 18 ? t.greeting.afternoon : t.greeting.evening;
  const dateLocale = locale === "tr" ? "tr-TR" : locale === "ru" ? "ru-RU" : "en-US";

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2327] tracking-tight">{greeting}</h1>
          <p className="text-sm text-[#9B8A8F] mt-1">
            {new Date().toLocaleDateString(dateLocale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="px-3 py-2 text-xs font-medium text-[#9B8A8F] hover:text-[#2D2327] border border-[#F0E8EB] rounded-xl hover:bg-white transition-colors">
            {t.viewSite} ↗
          </Link>
          <AdminLogout label={t.signOut} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-white rounded-2xl border border-[#F0E8EB] p-5 group hover:shadow-lg transition-all">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-slate-50 rounded-full" />
          <p className="text-[11px] font-semibold text-[#9B8A8F] uppercase tracking-wider mb-3">{t.metrics.totalBookings}</p>
          <p className="text-3xl font-bold text-[#2D2327]">{totalCount}</p>
          <p className="text-[11px] text-[#9B8A8F] mt-1">{t.metrics.allTime}</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 p-5 group hover:shadow-lg transition-all">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-amber-100/50 rounded-full" />
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-3">{t.metrics.pending}</p>
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-[11px] text-amber-500 mt-1">{totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0}% {t.metrics.ofTotal}</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-5 group hover:shadow-lg transition-all">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-emerald-100/50 rounded-full" />
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-3">{t.metrics.confirmed}</p>
          <p className="text-3xl font-bold text-emerald-600">{confirmedCount}</p>
          <p className="text-[11px] text-emerald-500 mt-1">{completedCount} {t.metrics.completed}</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 p-5 group hover:shadow-lg transition-all">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-red-100/50 rounded-full" />
          <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-3">{t.metrics.cancelled}</p>
          <p className="text-3xl font-bold text-red-500">{cancelledCount}</p>
          <p className="text-[11px] text-red-400 mt-1">{totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0}% {t.metrics.cancelRate}</p>
        </div>
      </div>
    </>
  );
}
