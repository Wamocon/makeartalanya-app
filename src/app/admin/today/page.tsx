import { createClient } from "@/lib/supabase/server";
import { CalendarCheck, Users, Clock, CheckCircle } from "lucide-react";

export default async function AdminTodayPage() {
  const supabase = await createClient();
  
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  // Fetch today's sessions
  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("*, class_types(name_en, color, icon, duration_min)")
    .gte("starts_at", todayStart)
    .lt("starts_at", todayEnd)
    .eq("status", "scheduled")
    .order("starts_at");

  const totalClasses = sessions?.length || 0;
  const totalEnrolled = sessions?.reduce((sum, s) => sum + s.enrolled_count, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2327]">Today&apos;s Classes</h1>
        <p className="text-sm text-[#9B8A8F] mt-1">
          {today.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <CalendarCheck className="w-5 h-5 text-[#A9C7E5] mb-2" />
          <p className="text-2xl font-bold text-[#2D2327]">{totalClasses}</p>
          <p className="text-xs text-[#9B8A8F]">Classes</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <Users className="w-5 h-5 text-[#DCA8B2] mb-2" />
          <p className="text-2xl font-bold text-[#2D2327]">{totalEnrolled}</p>
          <p className="text-xs text-[#9B8A8F]">Students</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <CheckCircle className="w-5 h-5 text-[#6BBF7A] mb-2" />
          <p className="text-2xl font-bold text-[#2D2327]">0</p>
          <p className="text-xs text-[#9B8A8F]">Completed</p>
        </div>
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {sessions && sessions.length > 0 ? (
          sessions.map((session) => {
            const ct = session.class_types as Record<string, unknown> | null;
            const startTime = new Date(session.starts_at).toLocaleTimeString("en", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            const endTime = new Date(session.ends_at).toLocaleTimeString("en", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            const spotsLeft = session.max_capacity - session.enrolled_count;

            return (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-[#F0E8EB] p-4 flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: (ct?.color as string) || "#DCA8B2" }}
                >
                  {((ct?.name_en as string) || "C").charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#2D2327]">{(ct?.name_en as string) || "Class"}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
                      <Clock className="w-3 h-3" /> {startTime} – {endTime}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
                      <Users className="w-3 h-3" /> {session.enrolled_count}/{session.max_capacity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    spotsLeft <= 0 
                      ? "bg-[#E5686B]/10 text-[#E5686B]"
                      : spotsLeft <= 2 
                        ? "bg-[#F2B63D]/10 text-[#F2B63D]"
                        : "bg-[#6BBF7A]/10 text-[#6BBF7A]"
                  }`}>
                    {spotsLeft <= 0 ? "Full" : `${spotsLeft} spots`}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-[#F0E8EB]">
            <CalendarCheck className="w-10 h-10 text-[#9B8A8F]/30 mx-auto mb-3" />
            <p className="text-[#9B8A8F] font-medium">No classes scheduled today</p>
            <p className="text-xs text-[#9B8A8F] mt-1">Sessions will appear here once generated</p>
          </div>
        )}
      </div>
    </div>
  );
}
