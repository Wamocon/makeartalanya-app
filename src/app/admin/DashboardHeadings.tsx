"use client";

import { useAdminLocale } from "@/components/admin/AdminLocaleProvider";

export function AnalyticsHeading() {
  const { t } = useAdminLocale();
  return <h2 className="text-sm font-semibold text-[#2D2327] mb-4">{t.analytics}</h2>;
}

export function RecentBookingsHeading() {
  const { t } = useAdminLocale();
  return <h2 className="text-sm font-semibold text-[#2D2327] mb-4">{t.recentBookings}</h2>;
}
