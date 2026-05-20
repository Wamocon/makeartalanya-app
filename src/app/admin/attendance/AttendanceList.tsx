"use client";

import { useState } from "react";
import { Check, X, CheckCheck } from "lucide-react";

interface Enrollment {
  id: string;
  status: string;
  attended_at: string | null;
  child_id: string | null;
  subscription_id: string | null;
  profiles: { full_name: string | null; phone: string | null } | null;
  children: { full_name: string | null; birth_date: string | null } | null;
}

interface Session {
  id: string;
  starts_at: string;
  ends_at: string;
  max_capacity: number;
  enrolled_count: number;
  class_types: { name_en: string; color: string; icon: string } | null;
  enrollments: Enrollment[];
}

export default function AttendanceList({ sessions: initial }: { sessions: Session[] }) {
  const [sessions, setSessions] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  async function markAttendance(sessionId: string, enrollmentId: string, attended: boolean) {
    setLoading(enrollmentId);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment_id: enrollmentId, attended }),
      });

      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  enrollments: s.enrollments.map((e) =>
                    e.id === enrollmentId
                      ? { ...e, attended_at: attended ? new Date().toISOString() : null, status: attended ? "attended" : "confirmed" }
                      : e
                  ),
                }
              : s
          )
        );
      }
    } finally {
      setLoading(null);
    }
  }

  async function markAllPresent(sessionId: string) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const unmarked = session.enrollments.filter((e) => !e.attended_at);
    if (unmarked.length === 0) return;
    
    setLoading(`all-${sessionId}`);
    try {
      for (const enrollment of unmarked) {
        await fetch("/api/admin/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollment_id: enrollment.id, attended: true }),
        });
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                enrollments: s.enrollments.map((e) => ({
                  ...e,
                  attended_at: e.attended_at || new Date().toISOString(),
                  status: "attended",
                })),
              }
            : s
        )
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => {
        const ct = session.class_types;
        const startTime = new Date(session.starts_at).toLocaleTimeString("en", {
          hour: "2-digit", minute: "2-digit", hour12: false,
        });
        const attended = session.enrollments.filter((e) => e.attended_at).length;
        const total = session.enrollments.length;
        const allAttended = total > 0 && attended === total;
        const isMarkingAll = loading === `all-${session.id}`;

        return (
          <div key={session.id} className="bg-white rounded-xl border border-[#F0E8EB] overflow-hidden">
            {/* Session header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0E8EB] bg-[#FAFAFA]">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: ct?.color || "#DCA8B2" }}
              >
                {(ct?.name_en || "C").charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#2D2327]">{ct?.name_en || "Class"}</h3>
                <p className="text-xs text-[#9B8A8F]">{startTime} · {total} enrolled</p>
              </div>
              {/* Mark All Present button */}
              {total > 0 && !allAttended && (
                <button
                  onClick={() => markAllPresent(session.id)}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 mr-2"
                  title="Mark all students present"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {isMarkingAll ? "..." : "All Present"}
                </button>
              )}
              <div className="text-right">
                <span className="text-sm font-semibold text-[#2D2327]">{attended}/{total}</span>
                <p className="text-[10px] text-[#9B8A8F]">attended</p>
              </div>
            </div>

            {/* Student list */}
            {session.enrollments.length > 0 ? (
              <div className="divide-y divide-[#F0E8EB]">
                {session.enrollments.map((enrollment) => {
                  const name = enrollment.children?.full_name || enrollment.profiles?.full_name || "Unknown";
                  const isChild = !!enrollment.children;
                  const parentName = isChild ? enrollment.profiles?.full_name : null;
                  const isAttended = !!enrollment.attended_at;
                  const isLoading = loading === enrollment.id;

                  return (
                    <div key={enrollment.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D2327] truncate">{name}</p>
                        {parentName && (
                          <p className="text-[11px] text-[#9B8A8F]">Parent: {parentName}</p>
                        )}
                      </div>

                      {/* Status / Action buttons */}
                      <div className="flex items-center gap-2">
                        {isAttended ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              ✓ Present
                            </span>
                            <button
                              onClick={() => markAttendance(session.id, enrollment.id, false)}
                              disabled={isLoading}
                              className="p-1.5 rounded-lg text-[#9B8A8F] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Undo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => markAttendance(session.id, enrollment.id, true)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#DCA8B2] text-white rounded-lg hover:bg-[#B87A88] transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {isLoading ? "..." : "Mark Present"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-6 text-center text-sm text-[#9B8A8F]">
                No students enrolled in this session
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
