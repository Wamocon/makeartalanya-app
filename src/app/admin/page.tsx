import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminLogout from "./AdminLogout";
import BookingTable from "./BookingTable";
import BookingCharts from "./BookingCharts";

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
    .from("bookings")
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2327]">Dashboard</h1>
          <p className="text-sm text-[#9B8A8F] mt-1">Booking overview &amp; management</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="px-3 py-2 text-xs font-medium text-[#9B8A8F] hover:text-[#2D2327] border border-[#F0E8EB] rounded-xl hover:bg-white transition-colors">
            View Site ↗
          </Link>
          <AdminLogout />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Total</span>
              </div>
              <div className="text-3xl font-bold tracking-tight">{totalCount}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending</span>
              </div>
              <div className="text-3xl font-bold tracking-tight text-amber-600">{pendingCount}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Confirmed</span>
              </div>
              <div className="text-3xl font-bold tracking-tight text-emerald-600">{confirmedCount}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-red-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Cancelled</span>
              </div>
              <div className="text-3xl font-bold tracking-tight text-red-500">{cancelledCount}</div>
            </div>
          </div>

          {/* Quick Links to Management Pages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/admin/schedule", label: "Schedule", icon: "📅", desc: "Manage weekly classes" },
              { href: "/admin/attendance", label: "Attendance", icon: "✓", desc: "Mark today's attendance" },
              { href: "/admin/clients", label: "Clients", icon: "👥", desc: "View all clients" },
              { href: "/admin/subscriptions", label: "Subscriptions", icon: "💳", desc: "Manage packages" },
              { href: "/admin/payments", label: "Payments", icon: "💰", desc: "Payment history" },
              { href: "/admin/sessions", label: "Sessions", icon: "🗓", desc: "14-day overview" },
              { href: "/admin/notifications", label: "Notifications", icon: "🔔", desc: "Sent messages" },
              { href: "/admin/settings", label: "Settings", icon: "⚙", desc: "Studio config" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-xl p-3.5 hover:shadow-md hover:border-[var(--pink-light)] transition-all group"
              >
                <div className="text-lg mb-1">{item.icon}</div>
                <p className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--pink-dark)] transition-colors">{item.label}</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>

          {/* Charts */}
          <BookingCharts data={chartData} />

          {/* Bookings Table */}
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-sm">
              Error loading bookings: {error.message}
            </div>
          ) : (
            <BookingTable bookings={bookings} />
          )}
    </div>
  );
}
