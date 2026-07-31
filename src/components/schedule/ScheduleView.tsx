"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Baby, ChevronLeft, ChevronRight } from "lucide-react";

interface ClassType {
  id: number;
  slug: string;
  name_en: string;
  name_tr: string;
  name_ru: string;
  color: string;
  icon: string;
  duration_min: number;
  max_capacity: number;
  age_min: number | null;
  age_max: number | null;
}

interface Template {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_capacity: number | null;
  class_types: ClassType;
}

interface Session {
  id: string;
  starts_at: string;
  ends_at: string;
  enrolled_count: number;
  max_capacity: number;
  status: string;
  class_types: {
    name_en: string;
    name_tr: string;
    name_ru: string;
    color: string;
    icon: string;
    slug: string;
  };
}

type Locale = "tr" | "en" | "ru";

/** Intl locale tag used for dates and times rendered on this page. */
const INTL: Record<Locale, string> = { tr: "tr-TR", en: "en-GB", ru: "ru-RU" };

const COPY: Record<Locale, Record<string, string>> = {
  tr: { all: "Tümü", today: "Bugün", spots: "yer", full: "Dolu", book: "Rezervasyon",
        waitlist: "Sıraya gir", booked: "Kaydedildi", onWaitlist: "Sıradasınız", failed: "Başarısız" },
  en: { all: "All", today: "Today", spots: "spots", full: "Full", book: "Book",
        waitlist: "Waitlist", booked: "Booked", onWaitlist: "On waitlist", failed: "Failed to book" },
  ru: { all: "Все", today: "Сегодня", spots: "мест", full: "Мест нет", book: "Записаться",
        waitlist: "В очередь", booked: "Записано", onWaitlist: "В очереди", failed: "Не удалось" },
};

/** Class-type names are stored per language; fall back to English then Turkish. */
function typeName(
  ct: { name_en?: string; name_tr?: string; name_ru?: string } | null | undefined,
  locale: Locale,
): string {
  if (!ct) return "";
  const byLocale = locale === "tr" ? ct.name_tr : locale === "ru" ? ct.name_ru : ct.name_en;
  return byLocale || ct.name_en || ct.name_tr || "";
}

/** Monday-first weekday labels for the active locale, derived from Intl. */
function weekdayLabels(locale: Locale, style: "short" | "long"): string[] {
  const fmt = new Intl.DateTimeFormat(INTL[locale], { weekday: style });
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(Date.UTC(2024, 0, 1 + i))),
  );
}

export default function ScheduleView({
  classTypes,
  templates,
  sessions,
  locale = "en",
}: {
  classTypes: ClassType[];
  templates: Template[];
  sessions: Session[];
  locale?: Locale;
}) {
  const L = COPY[locale] ?? COPY.en;
  const intl = INTL[locale] ?? INTL.en;
  const DAYS = weekdayLabels(locale, "short");
  const DAYS_FULL = weekdayLabels(locale, "long");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Get current week dates
  const today = new Date();
  const currentDay = (today.getDay() + 6) % 7; // 0=Mon
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDay + weekOffset * 7);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Group sessions by day
  const sessionsByDay: Record<number, Session[]> = {};
  sessions.forEach((session) => {
    const date = new Date(session.starts_at);
    const dayIndex = (date.getDay() + 6) % 7;
    const sessionWeekStart = new Date(date);
    sessionWeekStart.setDate(date.getDate() - dayIndex);

    // Check if session is in current viewed week
    if (
      sessionWeekStart.toDateString() === weekStart.toDateString()
    ) {
      if (!sessionsByDay[dayIndex]) sessionsByDay[dayIndex] = [];
      sessionsByDay[dayIndex].push(session);
    }
  });

  // If no sessions, fall back to templates
  const useTemplates = sessions.length === 0;

  const filteredTemplates = selectedType
    ? templates.filter((t) => t.class_types?.slug === selectedType)
    : templates;

  return (
    <div className="space-y-6">
      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedType(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !selectedType
              ? "bg-[#2D2327] text-white"
              : "bg-white border border-[#F0E8EB] text-[#9B8A8F] hover:border-[#DCA8B2]"
          }`}
        >
          {L.all}
        </button>
        {classTypes.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setSelectedType(ct.slug === selectedType ? null : ct.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              selectedType === ct.slug
                ? "text-white"
                : "bg-white border border-[#F0E8EB] text-[#9B8A8F] hover:border-[#DCA8B2]"
            }`}
            style={selectedType === ct.slug ? { backgroundColor: ct.color } : {}}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ct.color }}
            />
            {typeName(ct, locale)}
          </button>
        ))}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="p-2 rounded-lg hover:bg-[#F5E6EA] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#9B8A8F]" />
        </button>
        <span className="text-sm font-medium text-[#2D2327]">
          {weekDates[0].toLocaleDateString(intl, { month: "short", day: "numeric" })}
          {" — "}
          {weekDates[6].toLocaleDateString(intl, { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          disabled={weekOffset >= 1}
          className="p-2 rounded-lg hover:bg-[#F5E6EA] transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-[#9B8A8F]" />
        </button>
      </div>

      {/* Schedule grid */}
      <div className="space-y-4">
        {DAYS.map((day, dayIndex) => {
          const dayDate = weekDates[dayIndex];
          const isToday = dayDate.toDateString() === today.toDateString();
          const isPast = dayDate < today && !isToday;

          // Get classes for this day
          const daySessions = sessionsByDay[dayIndex] || [];
          const dayTemplates = useTemplates
            ? filteredTemplates.filter((t) => t.day_of_week === dayIndex)
            : [];
          const items = useTemplates ? dayTemplates : daySessions;

          if (items.length === 0 && !useTemplates) return null;
          if (dayTemplates.length === 0 && useTemplates) return null;

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.05 }}
              className={`${isPast ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isToday ? "text-[#DCA8B2]" : "text-[#9B8A8F]"
                  }`}
                >
                  {DAYS_FULL[dayIndex]}
                </span>
                <span className="text-xs text-[#9B8A8F]">
                  {dayDate.toLocaleDateString(intl, { month: "short", day: "numeric" })}
                </span>
                {isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-[#DCA8B2] text-white text-[10px] font-medium">
                    {L.today}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {useTemplates
                  ? dayTemplates.map((tmpl) => (
                      <TemplateCard key={tmpl.id} template={tmpl} locale={locale} L={L} />
                    ))
                  : daySessions
                      .filter(
                        (s) =>
                          !selectedType || s.class_types?.slug === selectedType
                      )
                      .map((session) => (
                        <SessionCard key={session.id} session={session} locale={locale} intl={intl} L={L} />
                      ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TemplateCard({
  template, locale, L,
}: { template: Template; locale: Locale; L: Record<string, string> }) {
  const ct = template.class_types;
  if (!ct) return null;

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3 hover:border-[#DCA8B2]/50 transition-colors">
      <div
        className="w-1 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: ct.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2D2327]">{typeName(ct, locale)}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
            <Clock className="w-3 h-3" />
            {template.start_time.slice(0, 5)} – {template.end_time.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
            <Users className="w-3 h-3" />
            {template.max_capacity || ct.max_capacity} {L.spots}
          </span>
          {(ct.age_min || ct.age_max) && (
            <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
              <Baby className="w-3 h-3" />
              {ct.age_min || 0}–{ct.age_max || "∞"} yrs
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({
  session, locale, intl, L,
}: { session: Session; locale: Locale; intl: string; L: Record<string, string> }) {
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [waitlisted, setWaitlisted] = useState<number | null>(null);
  const [error, setError] = useState("");
  const ct = session.class_types;
  const startTime = new Date(session.starts_at).toLocaleTimeString(intl, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endTime = new Date(session.ends_at).toLocaleTimeString(intl, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const spotsLeft = session.max_capacity - session.enrolled_count;
  const isFull = spotsLeft <= 0;

  async function handleBook() {
    setBooking(true);
    setError("");
    try {
      // A full session goes on the waitlist instead. The button used to say
      // "Waitlist" but still POSTed to /api/enroll, which answered "Session is
      // full" — a dead end.
      const endpoint = isFull ? "/api/waitlist" : "/api/enroll";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id }),
      });
      const data = await res.json();

      if (res.ok) {
        if (isFull) setWaitlisted(data.position ?? 0);
        else setBooked(true);
      } else if (res.status === 401) {
        window.location.href = `/auth/login?redirect=/schedule`;
      } else if (res.status === 409 && typeof data.position === "number") {
        setWaitlisted(data.position);
      } else {
        setError(data.error || L.failed);
      }
    } catch {
      setError("Network error");
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3 hover:border-[#DCA8B2]/50 transition-colors">
      <div
        className="w-1 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: ct?.color || "#DCA8B2" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2D2327]">{typeName(ct, locale) || "Class"}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
            <Clock className="w-3 h-3" />
            {startTime} – {endTime}
          </span>
          <span
            className={`flex items-center gap-1 text-xs ${
              isFull ? "text-[#E5686B]" : "text-[#6BBF7A]"
            }`}
          >
            <Users className="w-3 h-3" />
            {isFull ? L.full : `${spotsLeft} ${L.spots}`}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {booked ? (
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            {L.booked} ✓
          </span>
        ) : waitlisted !== null ? (
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            {waitlisted > 0 ? `${L.waitlist} #${waitlisted}` : L.onWaitlist}
          </span>
        ) : (
          <button
            onClick={handleBook}
            disabled={booking}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isFull
                ? "bg-[#F5E6EA] text-[#9B8A8F]"
                : "bg-[#DCA8B2] text-white hover:bg-[#B87A88] disabled:opacity-50"
            }`}
          >
            {booking ? "…" : isFull ? L.waitlist : L.book}
          </button>
        )}
        {error && <span className="text-[10px] text-red-500 max-w-[80px] text-right">{error}</span>}
      </div>
    </div>
  );
}
