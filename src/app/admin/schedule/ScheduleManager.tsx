"use client";

import { useState } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ClassType {
  id: string;
  name_en: string;
  color: string;
  duration_min: number;
  max_capacity: number;
}

interface Session {
  id: string;
  starts_at: string;
  ends_at: string;
  max_capacity: number;
  enrolled_count: number;
  status: string;
  cancel_reason: string | null;
  notes: string | null;
  class_types: ClassType | null;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ScheduleManager({
  sessions: initial,
  classTypes,
  weekStart: initialWeekStart,
}: {
  sessions: Session[];
  classTypes: ClassType[];
  weekStart: string;
}) {
  const [sessions, setSessions] = useState(initial);
  const [weekStart, setWeekStart] = useState(new Date(initialWeekStart));
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSession, setNewSession] = useState({
    class_type_id: "",
    date: "",
    time: "10:00",
    max_capacity: 8,
  });

  function navigateWeek(dir: number) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + dir * 7);
    setWeekStart(next);
    // Reload sessions for new week
    fetchWeekSessions(next);
  }

  async function fetchWeekSessions(start: Date) {
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const res = await fetch(
      `/api/admin/sessions?start=${start.toISOString()}&end=${end.toISOString()}`
    );
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions || []);
    }
  }

  async function createSession() {
    if (!newSession.class_type_id || !newSession.date || !newSession.time) return;
    setLoading(true);
    try {
      const ct = classTypes.find((c) => c.id === newSession.class_type_id);
      const startsAt = new Date(`${newSession.date}T${newSession.time}:00`);
      const endsAt = new Date(startsAt.getTime() + (ct?.duration_min || 60) * 60000);

      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_type_id: newSession.class_type_id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          max_capacity: newSession.max_capacity,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessions((prev) => [...prev, data.session].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
        setShowCreate(false);
        setNewSession({ class_type_id: "", date: "", time: "10:00", max_capacity: 8 });
      }
    } finally {
      setLoading(false);
    }
  }

  async function cancelSession(id: string) {
    const reason = prompt("Cancel reason (optional):");
    const res = await fetch("/api/admin/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel", reason }),
    });
    if (res.ok) {
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s)));
    }
  }

  // Group sessions by day of week
  const sessionsByDay = DAYS.map((_, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    const dayStr = dayDate.toISOString().slice(0, 10);
    return sessions.filter((s) => s.starts_at.slice(0, 10) === dayStr);
  });

  const weekLabel = `${weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateWeek(-1)} className="p-2 rounded-lg hover:bg-[#F0E8EB] transition-colors">
            <ChevronLeft className="w-4 h-4 text-[#2D2327]" />
          </button>
          <span className="text-sm font-medium text-[#2D2327]">{weekLabel}</span>
          <button onClick={() => navigateWeek(1)} className="p-2 rounded-lg hover:bg-[#F0E8EB] transition-colors">
            <ChevronRight className="w-4 h-4 text-[#2D2327]" />
          </button>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#2D2327] text-white rounded-xl hover:bg-[#2D2327]/90"
        >
          <Plus className="w-3.5 h-3.5" /> Add Session
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-5 space-y-4">
          <h3 className="font-medium text-[#2D2327]">New Session</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <select
              value={newSession.class_type_id}
              onChange={(e) => setNewSession({ ...newSession, class_type_id: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            >
              <option value="">Class type...</option>
              {classTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>{ct.name_en}</option>
              ))}
            </select>
            <input
              type="date"
              value={newSession.date}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            />
            <input
              type="time"
              value={newSession.time}
              onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            />
            <input
              type="number"
              min={1}
              max={20}
              value={newSession.max_capacity}
              onChange={(e) => setNewSession({ ...newSession, max_capacity: parseInt(e.target.value) || 8 })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
              placeholder="Capacity"
            />
          </div>
          <button
            onClick={createSession}
            disabled={loading || !newSession.class_type_id || !newSession.date}
            className="px-4 py-2 text-xs font-medium bg-[#DCA8B2] text-white rounded-lg hover:bg-[#B87A88] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Session"}
          </button>
        </div>
      )}

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, i) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + i);
          const isToday = dayDate.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
          const daySessions = sessionsByDay[i];

          return (
            <div key={day} className={`min-h-[180px] rounded-xl border ${isToday ? "border-[#DCA8B2] bg-[#DCA8B2]/5" : "border-[#F0E8EB] bg-white"} p-2`}>
              <div className="text-center mb-2">
                <p className={`text-xs font-medium ${isToday ? "text-[#DCA8B2]" : "text-[#9B8A8F]"}`}>{day}</p>
                <p className={`text-sm font-semibold ${isToday ? "text-[#DCA8B2]" : "text-[#2D2327]"}`}>
                  {dayDate.getDate()}
                </p>
              </div>
              <div className="space-y-1.5">
                {daySessions.map((s) => {
                  const time = new Date(s.starts_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false });
                  const isCancelled = s.status === "cancelled";
                  return (
                    <div
                      key={s.id}
                      className={`relative group text-[10px] rounded-lg p-1.5 ${isCancelled ? "opacity-40 line-through" : ""}`}
                      style={{ backgroundColor: `${s.class_types?.color || "#DCA8B2"}20` }}
                    >
                      <p className="font-medium text-[#2D2327] truncate">{time}</p>
                      <p className="text-[#9B8A8F] truncate">{s.class_types?.name_en || "—"}</p>
                      <p className="text-[#9B8A8F]">{s.enrolled_count}/{s.max_capacity}</p>
                      {!isCancelled && (
                        <button
                          onClick={() => cancelSession(s.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                          title="Cancel"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
