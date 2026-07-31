import { createClient } from "@/lib/supabase/server";
import { CalendarDays, CheckCircle, XCircle, Clock, Hourglass, Sparkles } from "lucide-react";
import Link from "next/link";
import { dashboardTranslations } from "@/i18n/dashboard";
import { getLocale } from "@/i18n/server";
import { CancelBookingButton, WaitlistActions } from "./ClassActions";

/** Cancelling or accepting a spot must be reflected on the next render. */
export const dynamic = "force-dynamic";

type ClassTypeRel = { name_en: string; color: string };

type SessionRel = {
  starts_at: string;
  ends_at: string;
  status?: string;
  // Embedded relations come back typed as arrays even when they are to-one.
  class_types: ClassTypeRel | ClassTypeRel[] | null;
};

/** Supabase types an embedded to-one relation as a possible array. */
function one<T>(rel: T | T[] | null | undefined): T | null {
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel ?? null;
}

export default async function MyClassesPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = dashboardTranslations[locale].classes;
  const { data: { user } } = await supabase.auth.getUser();

  const [upcomingResult, pastResult, waitlistResult] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, class_sessions(starts_at, ends_at, status, class_types(name_en, color))")
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
    supabase
      .from("waitlist")
      .select("id, status, position, expires_at, class_sessions(starts_at, ends_at, class_types(name_en, color))")
      .eq("user_id", user!.id)
      .in("status", ["waiting", "offered"])
      .order("position", { ascending: true }),
  ]);

  const upcoming = upcomingResult.data;
  const past = pastResult.data;
  const waitlist = waitlistResult.data;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#2D2327]">{t.title}</h1>

      {/* Waitlist — only shown when there is something on it */}
      {waitlist && waitlist.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-[#9B8A8F] uppercase tracking-wider mb-3">
            Waitlist
          </h2>
          <div className="space-y-2">
            {waitlist.map((w) => {
              const session = one<SessionRel>(w.class_sessions as unknown as SessionRel | SessionRel[]);
              const ct = one(session?.class_types);
              const offered = w.status === "offered";
              return (
                <div
                  key={w.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    offered
                      ? "bg-[#6BBF7A]/5 border-[#6BBF7A]/30"
                      : "bg-white border-[#F0E8EB]"
                  }`}
                >
                  <div
                    className="w-1 h-10 rounded-full"
                    style={{ backgroundColor: ct?.color || "#DCA8B2" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D2327] truncate flex items-center gap-1.5">
                      {offered && <Sparkles className="w-3.5 h-3.5 text-[#6BBF7A] shrink-0" />}
                      {ct?.name_en || "Class"}
                    </p>
                    <p className="text-xs text-[#9B8A8F]">
                      {session?.starts_at
                        ? new Date(session.starts_at).toLocaleDateString("en", {
                            weekday: "short", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : ""}
                      {offered
                        ? w.expires_at
                          ? ` · spot held until ${new Date(w.expires_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}`
                          : " · a spot is free"
                        : ` · position ${w.position}`}
                    </p>
                  </div>
                  <WaitlistActions
                    waitlistId={w.id}
                    status={w.status}
                    expiresAt={w.expires_at}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-medium text-[#9B8A8F] uppercase tracking-wider mb-3">
          {t.upcoming}
        </h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-2">
            {upcoming.map((e) => {
              const session = one<SessionRel>(e.class_sessions as unknown as SessionRel | SessionRel[]);
              const ct = one(session?.class_types);
              const cancelledByStudio = session?.status === "cancelled";
              return (
                <div key={e.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: ct?.color || "#DCA8B2" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D2327] truncate">
                      {ct?.name_en || "Class"}
                    </p>
                    <p className="text-xs text-[#9B8A8F]">
                      {session?.starts_at
                        ? new Date(session.starts_at).toLocaleDateString("en", {
                            weekday: "short", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : ""}
                    </p>
                    {cancelledByStudio && (
                      <p className="text-[11px] text-[#E5686B] mt-0.5">
                        The studio cancelled this class
                      </p>
                    )}
                  </div>
                  <Clock className="w-4 h-4 text-[#A9C7E5] shrink-0" />
                  <CancelBookingButton
                    enrollmentId={e.id}
                    className={ct?.name_en || "this class"}
                    startsAt={session?.starts_at ?? null}
                  />
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
              const session = one<SessionRel>(e.class_sessions as unknown as SessionRel | SessionRel[]);
              const ct = one(session?.class_types);
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
                        ? new Date(session.starts_at).toLocaleDateString("en", {
                            weekday: "short", month: "short", day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#9B8A8F] capitalize">{e.status.replace("_", " ")}</span>
                  {statusIcon}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-white rounded-xl border border-[#F0E8EB]">
            <Hourglass className="w-6 h-6 text-[#9B8A8F]/30 mx-auto mb-1.5" />
            <p className="text-sm text-[#9B8A8F]">No history yet</p>
          </div>
        )}
      </section>
    </div>
  );
}
