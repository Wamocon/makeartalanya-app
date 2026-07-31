import { createClient } from "@/lib/supabase/server";
import { CreditCard, Clock, Snowflake } from "lucide-react";
import { dashboardTranslations } from "@/i18n/dashboard";
import { getLocale } from "@/i18n/server";

export default async function MySubscriptionsPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = dashboardTranslations[locale].subscriptions;
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, packages(name, lessons_count, price_eur, price_per_lesson)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // subscription_freezes has no user_id — it hangs off subscription_id. The
  // previous query filtered on user_id and ordered by start_date/end_date, none
  // of which exist, so it always errored and the section never rendered.
  const subscriptionIds = (subscriptions ?? []).map((s) => s.id);

  const { data: freezes } = subscriptionIds.length
    ? await supabase
        .from("subscription_freezes")
        .select("id, subscription_id, frozen_at, planned_resume, actual_resume, reason")
        .in("subscription_id", subscriptionIds)
        .order("frozen_at", { ascending: false })
        .limit(5)
    : { data: null };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#2D2327]">{t.title}</h1>

      {subscriptions && subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const pkg = sub.packages as Record<string, unknown> | null;
            const totalLessons = sub.lessons_total || 0;
            const usedLessons = sub.lessons_used || 0;
            const remaining = totalLessons - usedLessons;
            const progress = totalLessons > 0 ? (remaining / totalLessons) * 100 : 0;
            const isExpired = sub.status === "expired";
            const isFrozen = sub.status === "frozen";

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl border p-5 ${
                  isExpired ? "border-[#E5E5E5] opacity-60" : "border-[#F0E8EB]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#DCA8B2]" />
                      <span className="font-medium text-[#2D2327]">
                        {(pkg?.name as string) || "Package"}
                      </span>
                    </div>
                    <p className="text-xs text-[#9B8A8F] mt-0.5">
                      Purchased {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      sub.status === "active"
                        ? "bg-[#6BBF7A]/10 text-[#6BBF7A]"
                        : isFrozen
                          ? "bg-[#A9C7E5]/10 text-[#A9C7E5]"
                          : "bg-[#9B8A8F]/10 text-[#9B8A8F]"
                    }`}
                  >
                    {isFrozen && <Snowflake className="w-3 h-3 inline mr-1" />}
                    {sub.status}
                  </span>
                </div>

                {/* Lessons progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-[#9B8A8F] mb-1">
                    <span>{remaining} lessons remaining</span>
                    <span>{totalLessons} total</span>
                  </div>
                  <div className="h-2 bg-[#F5E6EA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#DCA8B2] to-[#A9C7E5] rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Expiry */}
                {sub.expires_at && (
                  <div className="flex items-center gap-1 text-xs text-[#9B8A8F]">
                    <Clock className="w-3 h-3" />
                    <span>Expires {new Date(sub.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-[#F0E8EB]">
          <CreditCard className="w-10 h-10 text-[#9B8A8F]/30 mx-auto mb-3" />
          <p className="text-[#9B8A8F] font-medium">No subscriptions yet</p>
          <p className="text-xs text-[#9B8A8F] mt-1">Visit the studio to purchase a package</p>
        </div>
      )}

      {/* Recent Freezes */}
      {freezes && freezes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-[#9B8A8F] uppercase tracking-wider mb-3">
            Freeze History
          </h2>
          <div className="space-y-2">
            {freezes.map((f) => {
              const resumed = f.actual_resume ?? f.planned_resume;
              return (
                <div key={f.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3">
                  <Snowflake className="w-4 h-4 text-[#A9C7E5]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#2D2327]">
                      {new Date(f.frozen_at).toLocaleDateString()}
                      {" – "}
                      {resumed ? new Date(resumed).toLocaleDateString() : "ongoing"}
                    </p>
                    <p className="text-xs text-[#9B8A8F]">
                      {f.reason || "No reason"}
                      {!f.actual_resume && f.planned_resume && " · planned"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
