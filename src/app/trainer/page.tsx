import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarDays, Clock, Users, CheckCircle } from "lucide-react";

export default async function TrainerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Check trainer role
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "trainer" && profile.role !== "admin")) {
    redirect("/my");
  }

  // Fetch trainer's upcoming sessions (next 14 days)
  const now = new Date();
  const futureEnd = new Date(now);
  futureEnd.setDate(now.getDate() + 14);

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select(`
      id, starts_at, ends_at, max_capacity, enrolled_count, status, notes,
      class_types(name_en, color, duration_min, icon)
    `)
    .eq("trainer_id", user.id)
    .gte("starts_at", now.toISOString())
    .lt("starts_at", futureEnd.toISOString())
    .eq("status", "scheduled")
    .order("starts_at");

  // Fetch today's attendance
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: todaySessions } = await supabase
    .from("class_sessions")
    .select(`
      id, starts_at, ends_at, enrolled_count, max_capacity,
      class_types(name_en, color),
      enrollments(id, status, profiles(full_name), children(name))
    `)
    .eq("trainer_id", user.id)
    .gte("starts_at", todayStart.toISOString())
    .lt("starts_at", todayEnd.toISOString())
    .eq("status", "scheduled")
    .order("starts_at");

  const upcomingCount = sessions?.length || 0;
  const totalStudents = sessions?.reduce((sum, s) => sum + s.enrolled_count, 0) || 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#2D2327]">
            Hello, {profile.full_name?.split(" ")[0] || "Trainer"} 👋
          </h1>
          <p className="text-sm text-[#9B8A8F] mt-1">Your schedule overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-[#F0E8EB] p-4 text-center">
            <CalendarDays className="w-5 h-5 text-[#DCA8B2] mx-auto mb-1" />
            <div className="text-xl font-bold text-[#2D2327]">{upcomingCount}</div>
            <div className="text-[10px] text-[#9B8A8F] uppercase">Sessions</div>
          </div>
          <div className="bg-white rounded-xl border border-[#F0E8EB] p-4 text-center">
            <Users className="w-5 h-5 text-[#A9C7E5] mx-auto mb-1" />
            <div className="text-xl font-bold text-[#2D2327]">{totalStudents}</div>
            <div className="text-[10px] text-[#9B8A8F] uppercase">Students</div>
          </div>
          <div className="bg-white rounded-xl border border-[#F0E8EB] p-4 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-[#2D2327]">{todaySessions?.length || 0}</div>
            <div className="text-[10px] text-[#9B8A8F] uppercase">Today</div>
          </div>
        </div>

        {/* Today's Classes */}
        {todaySessions && todaySessions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-[#9B8A8F] uppercase tracking-wider mb-3">
              Today&apos;s Classes
            </h2>
            <div className="space-y-3">
              {todaySessions.map((session) => {
                const ct = session.class_types as unknown as Record<string, string> | null;
                const enrollments = (session.enrollments || []) as unknown as Array<{
                  id: string;
                  status: string;
                  profiles: { full_name: string } | null;
                  children: { name: string } | null;
                }>;
                return (
                  <div key={session.id} className="bg-white rounded-xl border border-[#F0E8EB] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: ct?.color || "#DCA8B2" }} />
                      <div className="flex-1">
                        <p className="font-medium text-[#2D2327]">{ct?.name_en || "Class"}</p>
                        <p className="text-xs text-[#9B8A8F]">
                          {new Date(session.starts_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                          {" – "}
                          {new Date(session.ends_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                          {" · "}{session.enrolled_count}/{session.max_capacity} students
                        </p>
                      </div>
                    </div>
                    {enrollments.length > 0 && (
                      <div className="pl-5 space-y-1">
                        {enrollments.map((e) => (
                          <div key={e.id} className="flex items-center gap-2 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${e.status === "attended" ? "bg-emerald-500" : e.status === "no_show" ? "bg-red-400" : "bg-amber-400"}`} />
                            <span className="text-[#2D2327]">
                              {e.children?.name || e.profiles?.full_name || "Student"}
                            </span>
                            <span className="text-[#9B8A8F] ml-auto capitalize">{e.status.replace("_", " ")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Upcoming Schedule */}
        <section>
          <h2 className="text-sm font-semibold text-[#9B8A8F] uppercase tracking-wider mb-3">
            Upcoming (Next 14 Days)
          </h2>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => {
                const ct = session.class_types as unknown as Record<string, string> | null;
                const startsAt = new Date(session.starts_at);
                return (
                  <div key={session.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3">
                    <div className="w-1 h-10 rounded-full" style={{ backgroundColor: ct?.color || "#DCA8B2" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2D2327] truncate">{ct?.name_en || "Class"}</p>
                      <div className="flex items-center gap-2 text-xs text-[#9B8A8F]">
                        <Clock className="w-3 h-3" />
                        {startsAt.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                        {" · "}
                        {startsAt.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#2D2327]">{session.enrolled_count}/{session.max_capacity}</div>
                      <div className="text-[10px] text-[#9B8A8F]">enrolled</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#F0E8EB] p-8 text-center">
              <CalendarDays className="w-8 h-8 text-[#F0E8EB] mx-auto mb-2" />
              <p className="text-sm text-[#9B8A8F]">No upcoming sessions scheduled</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
