"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateNavigator({ currentDate }: { currentDate: string }) {
  const router = useRouter();
  const date = new Date(currentDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);

  function navigate(dir: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + dir);
    const nextStr = next.toISOString().slice(0, 10);
    router.push(`/admin/attendance?date=${nextStr}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-lg hover:bg-[#F0E8EB] transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-[#2D2327]" />
      </button>
      <div className="text-center min-w-[140px]">
        <p className="text-sm font-medium text-[#2D2327]">
          {date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
        </p>
        {isToday && <p className="text-[10px] text-[#DCA8B2] font-medium">Today</p>}
      </div>
      <button
        onClick={() => navigate(1)}
        className="p-2 rounded-lg hover:bg-[#F0E8EB] transition-colors"
        disabled={isToday}
      >
        <ChevronRight className={`w-4 h-4 ${isToday ? "text-[#F0E8EB]" : "text-[#2D2327]"}`} />
      </button>
      {!isToday && (
        <button
          onClick={() => router.push("/admin/attendance")}
          className="px-3 py-1 text-[10px] font-medium text-[#DCA8B2] border border-[#DCA8B2] rounded-lg hover:bg-[#DCA8B2]/10"
        >
          Today
        </button>
      )}
    </div>
  );
}
