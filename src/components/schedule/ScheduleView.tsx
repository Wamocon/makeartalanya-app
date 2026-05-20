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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ScheduleView({
  classTypes,
  templates,
  sessions,
}: {
  classTypes: ClassType[];
  templates: Template[];
  sessions: Session[];
}) {
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
          All
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
            {ct.name_en}
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
          {weekDates[0].toLocaleDateString("en", { month: "short", day: "numeric" })}
          {" — "}
          {weekDates[6].toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
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
                  {dayDate.toLocaleDateString("en", { month: "short", day: "numeric" })}
                </span>
                {isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-[#DCA8B2] text-white text-[10px] font-medium">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {useTemplates
                  ? dayTemplates.map((tmpl) => (
                      <TemplateCard key={tmpl.id} template={tmpl} />
                    ))
                  : daySessions
                      .filter(
                        (s) =>
                          !selectedType || s.class_types?.slug === selectedType
                      )
                      .map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const ct = template.class_types;
  if (!ct) return null;

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3 hover:border-[#DCA8B2]/50 transition-colors">
      <div
        className="w-1 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: ct.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2D2327]">{ct.name_en}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
            <Clock className="w-3 h-3" />
            {template.start_time.slice(0, 5)} – {template.end_time.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
            <Users className="w-3 h-3" />
            {template.max_capacity || ct.max_capacity} spots
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

function SessionCard({ session }: { session: Session }) {
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState("");
  const ct = session.class_types;
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
  const isFull = spotsLeft <= 0;

  async function handleBook() {
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setBooked(true);
      } else if (res.status === 401) {
        window.location.href = `/auth/login?redirect=/schedule`;
      } else {
        setError(data.error || "Failed to book");
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
        <p className="text-sm font-medium text-[#2D2327]">{ct?.name_en || "Class"}</p>
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
            {isFull ? "Full" : `${spotsLeft} spots`}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {booked ? (
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Booked ✓
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
            {booking ? "..." : isFull ? "Waitlist" : "Book"}
          </button>
        )}
        {error && <span className="text-[10px] text-red-500 max-w-[80px] text-right">{error}</span>}
      </div>
    </div>
  );
}
