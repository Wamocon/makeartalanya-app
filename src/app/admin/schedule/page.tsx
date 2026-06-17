import { createClient } from "@/lib/supabase/server";
import { Calendar } from "lucide-react";
import ScheduleManager from "./ScheduleManager";

export default async function AdminSchedulePage() {
  const supabase = await createClient();

  // Fetch this week's sessions
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select(`
      id, starts_at, ends_at, max_capacity, enrolled_count, status, cancel_reason, notes,
      class_types(id, name_en, color, duration_min, max_capacity)
    `)
    .gte("starts_at", weekStart.toISOString())
    .lt("starts_at", weekEnd.toISOString())
    .order("starts_at");

  // Fetch class types for creating new sessions
  const { data: classTypes } = await supabase
    .from("class_types")
    .select("id, name_en, color, duration_min, max_capacity")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2327] flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#A9C7E5]" />
          Schedule
        </h1>
        <p className="text-sm text-[#9B8A8F] mt-1">Weekly class schedule management</p>
      </div>

      <ScheduleManager
        sessions={(sessions || []).map((s) => ({
          ...s,
          class_types: Array.isArray(s.class_types) ? s.class_types[0] : s.class_types,
        })) as unknown as import("./ScheduleManager").Session[]}
        classTypes={(classTypes || []) as unknown as import("./ScheduleManager").ClassType[]}
        weekStart={weekStart.toISOString()}
      />
    </div>
  );
}
