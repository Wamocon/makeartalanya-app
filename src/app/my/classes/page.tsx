import { createClient } from "@/lib/supabase/server";
import { CalendarDays, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { dashboardTranslations } from "@/i18n/dashboard";
import { getLocale } from "@/i18n/server";

export default async function MyClassesPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = dashboardTranslations[locale].classes;
  const { data: { user } } = await supabase.auth.getUser();

  // Run queries in parallel
  const [upcomingResult, pastResult] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, class_sessions(starts_at, ends_at, class_types(name_en, color))")
      .eq("user_id", user!.id)
      .eq("status", "confirmed")
      .order("booked_at", { ascending: false }),
    supabase
      .from("enrollments")
      .select("*, class_sessions(starts_at, ends_at, class_types(name_en, color))")
      .eq("user_id", user!.id)
      .in("status", ["attended", "no_show", "cancelled"])
      .order("booked_at", { ascending: false })
      .limit(20),
  ]);

  const upcoming = upcomingResult.data;
  const past = pastResult.data;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#2D2327]">{t.title}</h1>

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-medium text-[#9B8A8F] uppercase tracking-wider mb-3">
          {t.upcoming}
        </h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-2">
            {upcoming.map((e) => {
              const session = e.class_sessions as Record<string, unknown> | null;
              const ct = session?.class_types as Record<string, string> | null;
              return (
                <div key={e.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: ct?.color || "#DCA8B2" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D2327] truncate">{ct?.name_en || "Class"}</p>
                    <p className="text-xs text-[#9B8A8F]">
                      {session?.starts_at
                        ? new Date(session.starts_at as string).toLocaleDateString("en", {
                            weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-[#A9C7E5]" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-[#F0E8EB]">
            <CalendarDays className="w-8 h-8 text-[#9B8A8F]/40 mx-auto mb-2" />
            <p className="text-sm text-[#9B8A8F]">{t.noUpcoming}</p>
            <Link href="/schedule" className="text-xs text-[#DCA8B2] hover:underline mt-1 inline-block">
              {t.bookFirst} →
            </Link>
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-sm font-medium text-[#9B8A8F] uppercase tracking-wider mb-3">
          History
        </h2>
        {past && past.length > 0 ? (
          <div className="space-y-2">
            {past.map((e) => {
              const session = e.class_sessions as Record<string, unknown> | null;
              const ct = session?.class_types as Record<string, string> | null;
              const statusIcon = e.status === "attended"
                ? <CheckCircle className="w-4 h-4 text-[#6BBF7A]" />
                : e.status === "no_show"
                  ? <XCircle className="w-4 h-4 text-[#E5686B]" />
                  : <XCircle className="w-4 h-4 text-[#9B8A8F]" />;
              return (
                <div key={e.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3 opacity-70">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: ct?.color || "#DCA8B2" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D2327] truncate">{ct?.name_en || "Class"}</p>
                    <p className="text-xs text-[#9B8A8F]">
                      {session?.starts_at
                        ? new Date(session.starts_at as string).toLocaleDateString("en", {
                            weekday: "short", month: "short", day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                  {statusIcon}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#9B8A8F] text-center py-4">No history yet</p>
        )}
      </section>
    </div>
  );
}
