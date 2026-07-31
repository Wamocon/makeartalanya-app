import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/server";
import ScheduleView from "@/components/schedule/ScheduleView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Dynamic, not ISR.
 *
 * This page reads the `lang` cookie to localise class names, which opts the
 * route into dynamic rendering regardless — a `revalidate` export alongside it
 * would just be misleading. It is also the right call on the merits: the page
 * shows live seat counts and a "Book" button, and a 60-second cache meant a
 * class could read "3 spots" seconds after it filled up.
 */
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = await createClient();
  const locale = await getLocale();

  // Fetch class types
  const { data: classTypes } = await supabase
    .from("class_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  // Fetch schedule templates (active)
  const { data: templates } = await supabase
    .from("schedule_templates")
    .select("*, class_types(name_en, name_tr, name_ru, color, icon, duration_min, max_capacity, age_min, age_max)")
    .eq("is_active", true)
    .order("day_of_week")
    .order("start_time");

  // Fetch upcoming sessions (next 2 weeks)
  const now = new Date();
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("*, class_types(name_en, name_tr, name_ru, color, icon, slug)")
    .eq("status", "scheduled")
    .gte("starts_at", now.toISOString())
    .lte("starts_at", twoWeeksLater.toISOString())
    .order("starts_at");

  return (
    <div className="min-h-screen bg-[#FEFCFD]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FEFCFD]/95 backdrop-blur-sm border-b border-[#F0E8EB]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#9B8A8F] hover:text-[#2D2327] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-[#2D2327]">Class Schedule</h1>
          </div>
          <Link
            href="/auth/login?redirect=/schedule"
            className="text-sm text-[#DCA8B2] hover:text-[#B87A88] font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Schedule content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ScheduleView
          classTypes={classTypes || []}
          templates={templates || []}
          sessions={sessions || []}
          locale={locale}
        />
      </main>
    </div>
  );
}
