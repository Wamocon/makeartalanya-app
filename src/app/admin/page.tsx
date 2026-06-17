import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import BookingTable from "./BookingTable";
import BookingCharts from "./BookingCharts";
import DashboardHeader from "./DashboardHeader";
import { AnalyticsHeading, RecentBookingsHeading } from "./DashboardHeadings";

type BookingRow = {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  preferred_language: "tr" | "en" | "ru" | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  message: string | null;
  created_at: string;
};

export default async function AdminPage() {
  const admin = createAdminClient();

  if (!admin) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30 text-[var(--foreground)] p-6 sm:p-10">
        <div className="max-w-3xl mx-auto bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-3">Setup Required</h1>
          <p className="text-sm text-[var(--muted)] mb-4">
            Add these environment variables to enable the admin dashboard:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 text-[var(--muted)]">
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">SUPABASE_SERVICE_ROLE_KEY</code></li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">ADMIN_DASHBOARD_USER</code></li>
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">ADMIN_DASHBOARD_PASSWORD</code></li>
          </ul>
          <Link href="/" className="inline-flex items-center gap-1.5 mt-6 text-sm text-[var(--pink-dark)] hover:underline">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to site
          </Link>
        </div>
      </main>
    );
  }

  const { data, error } = await admin
    .from("legacy_bookings")
    .select("id, guest_name, guest_email, guest_phone, preferred_language, status, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const bookings = (data || []) as BookingRow[];

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const totalCount = bookings.length;

  // Chart data: last 7 days
  const now = new Date();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const count = bookings.filter((b) => b.created_at.slice(0, 10) === dayStr).length;
    return { label, count };
  });

  // Language breakdown
  const langMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const lang = b.preferred_language?.toUpperCase() || "N/A";
    langMap[lang] = (langMap[lang] || 0) + 1;
  });
  const languageData = Object.entries(langMap).map(([lang, count]) => ({ lang, count }));

  const chartData = {
    statusCounts: { pending: pendingCount, confirmed: confirmedCount, cancelled: cancelledCount, completed: completedCount },
    weeklyData,
    languageData,
  };

  return (
    <div className="space-y-8">
      <DashboardHeader
        totalCount={totalCount}
        pendingCount={pendingCount}
        confirmedCount={confirmedCount}
        cancelledCount={cancelledCount}
        completedCount={completedCount}
      />

      {/* Analytics Section */}
      <div>
        <AnalyticsHeading />
        <BookingCharts data={chartData} />
      </div>

      {/* Recent Bookings */}
      <div>
        <RecentBookingsHeading />
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-sm">
            Error loading bookings: {error.message}
          </div>
        ) : (
          <BookingTable bookings={bookings} />
        )}
      </div>
    </div>
  );
}
