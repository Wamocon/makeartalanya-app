import { createClient } from "@/lib/supabase/server";
import { CalendarDays, CreditCard, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ClientDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user subscriptions
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, packages(name, lessons_count)")
    .eq("user_id", user!.id)
    .in("status", ["active"])
    .order("expires_at", { ascending: true });

  // Fetch upcoming enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, class_sessions(starts_at, ends_at, class_types(name_en, color, icon))")
    .eq("user_id", user!.id)
    .eq("status", "confirmed")
    .order("booked_at", { ascending: false })
    .limit(5);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const activeSub = subscriptions?.[0];
  const totalLessons = activeSub?.lessons_total ?? 0;
  const usedLessons = activeSub?.lessons_used ?? 0;
  const remaining = totalLessons - usedLessons;
  const progressPercent = totalLessons > 0 ? (remaining / totalLessons) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#2D2327] tracking-tight">
          Hello, {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm sm:text-base text-[#9B8A8F] mt-1">Here&apos;s your studio overview</p>
      </div>

      {/* Subscription Card */}
      <div className="bg-white rounded-2xl border border-[#F0E8EB] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FDF2F4] flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5 text-[#DCA8B2]" />
            </div>
            <span className="text-sm font-semibold text-[#2D2327]">Subscription</span>
          </div>
          <Link href="/my/subscriptions" className="text-xs text-[#9B8A8F] hover:text-[#2D2327] transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {activeSub ? (
          <>
            <div className="flex items-end justify-between mb-3">
              <div>
                <span className="text-4xl font-bold text-[#2D2327]">{remaining}</span>
                <span className="text-sm text-[#9B8A8F] ml-1.5">/ {totalLessons} lessons remaining</span>
              </div>
              {activeSub.expires_at && (
                <span className="text-xs text-[#9B8A8F] bg-[#F5F5F5] px-2.5 py-1 rounded-lg">
                  expires {new Date(activeSub.expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div className="h-2.5 bg-[#F5F0F2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[linear-gradient(to_right,#DCA8B2,#A9C7E5)] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-[#F5F0F2] flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-5 h-5 text-[#9B8A8F]" />
            </div>
            <p className="text-sm font-medium text-[#2D2327]">No active subscription</p>
            <p className="text-xs text-[#9B8A8F] mt-1">Visit the studio to purchase a package</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/schedule"
          className="flex items-center gap-3 bg-white rounded-2xl border border-[#F0E8EB] p-4 sm:p-5 hover:border-[#A9C7E5] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarDays className="w-5 h-5 text-[#A9C7E5]" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#2D2327] block">Schedule</span>
            <span className="text-xs text-[#9B8A8F]">Browse classes</span>
          </div>
        </Link>
        <Link
          href="/my/children"
          className="flex items-center gap-3 bg-white rounded-2xl border border-[#F0E8EB] p-4 sm:p-5 hover:border-[#B8D4A8] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0F9F0] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5 text-[#B8D4A8]" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#2D2327] block">Children</span>
            <span className="text-xs text-[#9B8A8F]">Manage profiles</span>
          </div>
        </Link>
        <Link
          href="/my/subscriptions"
          className="flex items-center gap-3 bg-white rounded-2xl border border-[#F0E8EB] p-4 sm:p-5 hover:border-[#DCA8B2] hover:shadow-sm transition-all group col-span-2 lg:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5 text-[#DCA8B2]" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#2D2327] block">Subscriptions</span>
            <span className="text-xs text-[#9B8A8F]">View packages</span>
          </div>
        </Link>
      </div>

      {/* Upcoming Classes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-[#2D2327]">Upcoming Classes</h2>
          <Link href="/my/classes" className="text-xs text-[#9B8A8F] hover:text-[#2D2327] transition-colors flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {enrollments && enrollments.length > 0 ? (
          <div className="space-y-2.5">
            {enrollments.map((enrollment) => {
              const session = enrollment.class_sessions as Record<string, unknown> | null;
              const classType = session?.class_types as Record<string, string> | null;
              return (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-[#F0E8EB] p-4 hover:shadow-sm transition-shadow"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: (classType?.color || "#DCA8B2") + "20", color: classType?.color || "#DCA8B2" }}
                  >
                    🎨
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D2327] truncate">
                      {classType?.name_en || "Class"}
                    </p>
                    <p className="text-xs text-[#9B8A8F] mt-0.5">
                      {session?.starts_at
                        ? new Date(session.starts_at as string).toLocaleDateString("en", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D0C5C8] shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#F0E8EB]">
            <div className="w-14 h-14 rounded-full bg-[#F5F0F2] flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-6 h-6 text-[#9B8A8F]/60" />
            </div>
            <p className="text-sm font-medium text-[#2D2327]">No upcoming classes</p>
            <p className="text-xs text-[#9B8A8F] mt-1 mb-3">Book your first session to get started</p>
            <Link href="/schedule" className="inline-flex items-center gap-1 text-sm text-[#DCA8B2] hover:text-[#B87A88] font-medium transition-colors">
              Browse schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
