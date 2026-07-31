import { requireAdminPage } from "@/lib/auth-guard";
import { ClipboardCheck } from "lucide-react";
import AttendanceList from "./AttendanceList";
import DateNavigator from "./DateNavigator";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const { admin: supabase } = await requireAdminPage();

  // Use date from query or default to today
  const selectedDate = params.date ? new Date(params.date) : new Date();
  const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString();
  const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1).toISOString();
  const dateStr = selectedDate.toISOString().slice(0, 10);

  // Fetch sessions for selected date with enrollments
  const { data: sessions } = await supabase
    .from("class_sessions")
    .select(`
      id, starts_at, ends_at, max_capacity, enrolled_count, status,
      class_types(name_en, name_ru, color, icon)
    `)
    .gte("starts_at", dayStart)
    .lt("starts_at", dayEnd)
    .eq("status", "scheduled")
    .order("starts_at");

  // For each session, get enrollments
  const sessionsWithEnrollments = await Promise.all(
    (sessions || []).map(async (session: Record<string, unknown>) => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          id, status, attended_at, child_id, subscription_id,
          profiles:user_id(full_name, phone),
          children:child_id(full_name, birth_date)
        `)
        .eq("session_id", session.id as string)
        .neq("status", "cancelled");

      const ct = Array.isArray(session.class_types) ? session.class_types[0] : session.class_types;
      const mapped = (enrollments || []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        status: e.status as string,
        attended_at: e.attended_at as string | null,
        child_id: e.child_id as string | null,
        subscription_id: e.subscription_id as string | null,
        profiles: Array.isArray(e.profiles) ? e.profiles[0] : e.profiles,
        children: Array.isArray(e.children) ? e.children[0] : e.children,
      }));

      return {
        id: session.id as string,
        starts_at: session.starts_at as string,
        ends_at: session.ends_at as string,
        max_capacity: session.max_capacity as number,
        enrolled_count: session.enrolled_count as number,
        class_types: ct || null,
        enrollments: mapped,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2327] flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-[#DCA8B2]" />
            Attendance
          </h1>
          <p className="text-sm text-[#9B8A8F] mt-1">
            Mark attendance for classes. Lessons are auto-deducted on marking.
          </p>
        </div>
        <DateNavigator currentDate={dateStr} />
      </div>

      {sessionsWithEnrollments.length > 0 ? (
        <AttendanceList sessions={sessionsWithEnrollments} />
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-[#F0E8EB]">
          <ClipboardCheck className="w-12 h-12 text-[#9B8A8F]/30 mx-auto mb-3" />
          <p className="text-[#9B8A8F] font-medium">No classes scheduled today</p>
          <p className="text-xs text-[#9B8A8F] mt-1">Attendance marking appears when sessions are scheduled</p>
        </div>
      )}
    </div>
  );
}
