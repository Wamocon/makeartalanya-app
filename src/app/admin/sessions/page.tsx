import { createClient } from "@/lib/supabase/server";
import { CalendarCheck, Clock, Users, X } from "lucide-react";
import Link from "next/link";

export default async function AdminSessionsPage() {
  const supabase = await createClient();

  // Fetch upcoming sessions (next 14 days)
  const now = new Date();
  const futureEnd = new Date(now);
  futureEnd.setDate(now.getDate() + 14);

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select(`
      id, starts_at, ends_at, max_capacity, enrolled_count, status, cancel_reason, notes,
      class_types(name_en, color, duration_min)
    `)
    .gte("starts_at", now.toISOString())
    .lt("starts_at", futureEnd.toISOString())
    .order("starts_at");

  const scheduled = sessions?.filter((s) => s.status === "scheduled").length || 0;
  const cancelled = sessions?.filter((s) => s.status === "cancelled").length || 0;
  const totalEnrolled = sessions?.filter((s) => s.status === "scheduled").reduce((sum, s) => sum + s.enrolled_count, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2327] flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#A9C7E5]" />
            Sessions
          </h1>
          <p className="text-sm text-[#9B8A8F] mt-1">Upcoming 14 days overview</p>
        </div>
        <Link
          href="/admin/schedule"
          className="px-4 py-2 text-xs font-medium bg-[#2D2327] text-white rounded-xl hover:bg-[#2D2327]/90"
        >
          Open Schedule
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <CalendarCheck className="w-5 h-5 text-[#A9C7E5] mb-2" />
          <p className="text-2xl font-bold text-[#2D2327]">{scheduled}</p>
          <p className="text-xs text-[#9B8A8F]">Scheduled</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <Users className="w-5 h-5 text-[#DCA8B2] mb-2" />
          <p className="text-2xl font-bold text-[#2D2327]">{totalEnrolled}</p>
          <p className="text-xs text-[#9B8A8F]">Enrolled</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <X className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-2xl font-bold text-[#2D2327]">{cancelled}</p>
          <p className="text-xs text-[#9B8A8F]">Cancelled</p>
        </div>
      </div>

      {/* Session list grouped by day */}
      <div className="space-y-4">
        {sessions && sessions.length > 0 ? (
          (() => {
            // Group sessions by day
            const grouped: Record<string, typeof sessions> = {};
            sessions.forEach((session) => {
              const day = new Date(session.starts_at).toISOString().slice(0, 10);
              if (!grouped[day]) grouped[day] = [];
              grouped[day].push(session);
            });

            return Object.entries(grouped).map(([day, daySessions]) => {
              const dayDate = new Date(day + "T00:00:00");
              const isToday = dayDate.toDateString() === new Date().toDateString();
              const label = dayDate.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" });

              return (
                <div key={day}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-[#DCA8B2]" : "text-[#9B8A8F]"}`}>
                      {isToday ? "Today" : label}
                    </h3>
                    <div className="flex-1 h-px bg-[#F0E8EB]" />
                    <span className="text-[10px] text-[#9B8A8F]">{daySessions.length} session{daySessions.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-2">
                    {daySessions.map((session) => {
            const rawCt = session.class_types;
            const ct = (Array.isArray(rawCt) ? rawCt[0] : rawCt) as Record<string, unknown> | null;
            const startDate = new Date(session.starts_at);
            const time = startDate.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false });
            const isCancelled = session.status === "cancelled";
            const spotsLeft = session.max_capacity - session.enrolled_count;

            return (
              <div
                key={session.id}
                className={`bg-white rounded-xl border border-[#F0E8EB] p-4 flex items-center gap-4 ${isCancelled ? "opacity-50" : ""}`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: (ct?.color as string) || "#DCA8B2" }}
                >
                  {((ct?.name_en as string) || "C").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm text-[#2D2327] ${isCancelled ? "line-through" : ""}`}>
                    {(ct?.name_en as string) || "Class"}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
                      <Clock className="w-3 h-3" /> {time}
                      {(ct?.duration_min as number) ? ` · ${ct?.duration_min}min` : ""}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
                      <Users className="w-3 h-3" /> {session.enrolled_count}/{session.max_capacity}
                    </span>
                  </div>
                </div>
                <div>
                  {isCancelled ? (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-500">
                      Cancelled
                    </span>
                  ) : spotsLeft <= 0 ? (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                      Full
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                      {spotsLeft} spots
                    </span>
                  )}
                </div>
              </div>
            );
                    })}
                  </div>
                </div>
              );
            });
          })()
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-[#F0E8EB]">
            <CalendarCheck className="w-10 h-10 text-[#9B8A8F]/30 mx-auto mb-3" />
            <p className="text-[#9B8A8F] font-medium">No upcoming sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}
