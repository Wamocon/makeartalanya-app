import { createClient } from "@/lib/supabase/server";
import { CalendarDays, CreditCard, Users, ArrowRight, Sparkles, Clock } from "lucide-react";
import Link from "next/link";
import { dashboardTranslations } from "@/i18n/dashboard";
import { getLocale } from "@/i18n/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default async function ClientDashboard() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = dashboardTranslations[locale].dashboard;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [subsResult, enrollResult, profileResult, unreadResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*, packages(name, lessons_count)")
      .eq("user_id", user.id)
      .in("status", ["active"])
      .order("expires_at", { ascending: true }),
    supabase
      .from("enrollments")
      .select("*, class_sessions(starts_at, ends_at, class_types(name_en, color, icon))")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .order("booked_at", { ascending: false })
      .limit(5),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  const subscriptions = subsResult.data;
  const enrollments = enrollResult.data;
  const profile = profileResult.data;
  const unreadCount = unreadResult.count ?? 0;

  const activeSub = subscriptions?.[0];
  const totalLessons = activeSub?.lessons_total ?? 0;
  const usedLessons = activeSub?.lessons_used ?? 0;
  const remaining = Math.max(0, totalLessons - usedLessons);
  const progressPercent = totalLessons > 0 ? (remaining / totalLessons) * 100 : 0;

  const quickActions = [
    { href: "/schedule", icon: CalendarDays, title: t.schedule, desc: t.browseClasses, gradient: "from-[#A9C7E5] to-[#7BA3C9]", bg: "#EFF6FF" },
    { href: "/my/children", icon: Users, title: t.children, desc: t.manageProfiles, gradient: "from-[#B8D4A8] to-[#95C07F]", bg: "#F0F9F0" },
    { href: "/my/subscriptions", icon: CreditCard, title: t.subscriptions, desc: t.viewPackages, gradient: "from-[#DCA8B2] to-[#C48490]", bg: "#FDF2F4" },
  ];

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
          {t.greeting}, <span className="gradient-text-pink">{firstName}</span>
        </h1>
        <p className="text-base text-[var(--muted)] mt-1.5">{t.overview}</p>
      </div>

      {unreadCount > 0 && (
        <Link
          href="/my/notifications"
          className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[var(--pink-light)] to-white border border-[var(--pink)]/20 card-hover"
        >
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 text-[var(--pink)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              You have {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-[var(--muted)]">Tap to view</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--pink-dark)]" />
        </Link>
      )}

      {/* Subscription Card */}
      <Card glass className="p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--pink)]/10 to-[var(--blue)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--pink)] to-[var(--pink-dark)] flex items-center justify-center shadow-[var(--shadow-pink)]">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-semibold text-[var(--foreground)]">{t.subscription}</span>
            </div>
            <Link href="/my/subscriptions" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1">
              {t.viewAll} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {activeSub ? (
            <>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-5xl sm:text-6xl font-bold text-[var(--foreground)]">{remaining}</span>
                  <span className="text-sm text-[var(--muted)] ml-2">/ {totalLessons} {t.lessonsRemaining}</span>
                </div>
                {activeSub.expires_at && (
                  <Badge variant="blue">
                    {t.expires} {new Date(activeSub.expires_at).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              <div className="h-3 bg-[var(--border)]/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%`, background: "linear-gradient(to right, var(--pink), var(--blue))" }}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[var(--background)] flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-[var(--muted)]" />
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">{t.noSubscription}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{t.noSubscriptionDesc}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative overflow-hidden flex items-center gap-4 bg-white rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--pink)]/20 hover:shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: action.bg, color: "transparent" }}
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${action.gradient} opacity-10 group-hover:opacity-15 transition-opacity`} />
              <action.icon className="w-6 h-6 relative z-10" style={{ color: "var(--foreground)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-[var(--foreground)] block">{action.title}</span>
              <span className="text-xs text-[var(--muted)]">{action.desc}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--border)] group-hover:text-[var(--pink-dark)] transition-colors" />
          </Link>
        ))}
      </div>

      {/* Upcoming Classes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{t.upcomingClasses}</h2>
          <Link href="/my/classes" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1">
            {t.seeAll} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {enrollments && enrollments.length > 0 ? (
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const session = enrollment.class_sessions as Record<string, unknown> | null;
              const classType = session?.class_types as Record<string, string> | null;
              return (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-[var(--border)] p-4 hover:shadow-[var(--shadow-sm)] transition-shadow"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (classType?.color || "#DCA8B2") + "20", color: classType?.color || "#DCA8B2" }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{classType?.name_en || "Class"}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
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
                  <ArrowRight className="w-4 h-4 text-[var(--border)] shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-[var(--background)] flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-6 h-6 text-[var(--muted)]/60" />
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">{t.noUpcoming}</p>
            <p className="text-xs text-[var(--muted)] mt-1 mb-3">{t.noUpcomingDesc}</p>
            <Link href="/schedule" className="inline-flex items-center gap-1 text-sm text-[var(--pink-dark)] hover:text-[var(--pink)] font-medium transition-colors">
              {t.browseSchedule} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
