import Link from "next/link";
import { requireAdminPage } from "@/lib/auth-guard";
import BookingTable from "./BookingTable";
import BookingCharts from "./BookingCharts";
import DashboardHeader from "./DashboardHeader";
import { AnalyticsHeading } from "./DashboardHeadings";
import { ArrowRight, ClipboardList, CalendarCheck, Users, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

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

type RegistrationRow = {
  status: "new" | "contacted" | "enrolled" | "archived";
  preferred_language: string | null;
  created_at: string;
};

export default async function AdminPage() {
  const { admin } = await requireAdminPage();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const weekAhead = new Date(now.getTime() + 7 * 86_400_000);

  // The dashboard used to be driven entirely by `legacy_bookings`. That table
  // now holds both historical rows and lightweight homepage booking requests;
  // operational studio figures still come from registrations, class_sessions,
  // profiles and subscriptions.
  const [
    registrationsRes,
    todaySessionsRes,
    weekSessionsRes,
    clientsRes,
    activeSubsRes,
    legacyRes,
  ] = await Promise.all([
    admin
      .from("registrations")
      .select("status, preferred_language, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    admin
      .from("class_sessions")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", todayStart.toISOString())
      .lt("starts_at", todayEnd.toISOString())
      .eq("status", "scheduled"),
    admin
      .from("class_sessions")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", now.toISOString())
      .lt("starts_at", weekAhead.toISOString())
      .eq("status", "scheduled"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin
      .from("legacy_bookings")
      .select("id, guest_name, guest_email, guest_phone, preferred_language, status, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const registrations = (registrationsRes.data ?? []) as RegistrationRow[];
  const legacyBookings = (legacyRes.data ?? []) as BookingRow[];

  const newCount = registrations.filter((r) => r.status === "new").length;
  const contactedCount = registrations.filter((r) => r.status === "contacted").length;
  const enrolledCount = registrations.filter((r) => r.status === "enrolled").length;
  const archivedCount = registrations.filter((r) => r.status === "archived").length;

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const day = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString("en", { weekday: "short" }),
      count: registrations.filter((r) => r.created_at.slice(0, 10) === day).length,
    };
  });

  const langMap: Record<string, number> = {};
  for (const r of registrations) {
    const lang = r.preferred_language?.toUpperCase() || "N/A";
    langMap[lang] = (langMap[lang] || 0) + 1;
  }

  const chartData = {
    statusCounts: {
      pending: newCount,
      confirmed: enrolledCount,
      cancelled: archivedCount,
      completed: contactedCount,
    },
    weeklyData,
    languageData: Object.entries(langMap).map(([lang, count]) => ({ lang, count })),
  };

  const quickStats = [
    { href: "/admin/registrations", icon: ClipboardList, label: "New registrations", value: newCount, accent: "#DCA8B2" },
    { href: "/admin/today", icon: CalendarCheck, label: "Classes today", value: todaySessionsRes.count ?? 0, accent: "#A9C7E5" },
    { href: "/admin/sessions", icon: CalendarCheck, label: "Classes next 7 days", value: weekSessionsRes.count ?? 0, accent: "#8FBF9F" },
    { href: "/admin/clients", icon: Users, label: "Clients", value: clientsRes.count ?? 0, accent: "#C9A9E5" },
    { href: "/admin/subscriptions", icon: CreditCard, label: "Active subscriptions", value: activeSubsRes.count ?? 0, accent: "#E5C29A" },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader
        totalCount={registrations.length}
        pendingCount={newCount}
        confirmedCount={enrolledCount}
        cancelledCount={archivedCount}
        completedCount={contactedCount}
      />

      {/* Live operational figures */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {quickStats.map((s) => (
          <Link
            key={s.href + s.label}
            href={s.href}
            className="group bg-white rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--pink)]/30 hover:shadow-[var(--shadow-sm)] transition-all"
          >
            <s.icon className="w-5 h-5 mb-2" style={{ color: s.accent }} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
            <p className="text-xs text-[var(--muted)] flex items-center gap-1">
              {s.label}
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </Link>
        ))}
      </div>

      <div>
        <AnalyticsHeading />
        <BookingCharts data={chartData} />
      </div>

      {/* Lightweight homepage requests plus historical booking records. */}
      {legacyBookings.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)] mb-4 select-none">
            Quick booking requests & history ({legacyBookings.length})
            <span className="ml-2 font-normal text-xs text-[var(--muted)]">
              — includes homepage requests and older booking records.
            </span>
          </summary>
          <BookingTable bookings={legacyBookings} />
        </details>
      )}
    </div>
  );
}
