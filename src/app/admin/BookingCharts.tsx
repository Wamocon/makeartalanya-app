"use client";

interface ChartData {
  statusCounts: { pending: number; confirmed: number; cancelled: number; completed: number };
  weeklyData: { label: string; count: number }[];
  languageData: { lang: string; count: number }[];
}

function StatusDonutChart({ data }: { data: ChartData["statusCounts"] }) {
  const total = data.pending + data.confirmed + data.cancelled + data.completed || 1;
  const segments = [
    { label: "Pending", count: data.pending, color: "#f59e0b" },
    { label: "Confirmed", count: data.confirmed, color: "#10b981" },
    { label: "Cancelled", count: data.cancelled, color: "#ef4444" },
    { label: "Completed", count: data.completed, color: "#3b82f6" },
  ];

  let cumulativePercent = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const percent = seg.count / total;
            const offset = cumulativePercent * circumference;
            cumulativePercent += percent;
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${percent * circumference} ${circumference}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              />
            );
          })}
          {/* Inner white circle for donut effect */}
          <circle cx="50" cy="50" r="30" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold leading-none">{total}</div>
            <div className="text-[9px] text-[var(--muted)] mt-0.5">total</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.filter(s => s.count > 0).map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-[var(--muted)]">{seg.label}</span>
            <span className="text-xs font-semibold ml-auto">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyBarChart({ data }: { data: ChartData["weeklyData"] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium text-[var(--foreground)]">
            {item.count > 0 ? item.count : ""}
          </span>
          <div className="w-full relative rounded-t-md overflow-hidden bg-slate-100" style={{ height: "100%" }}>
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-[var(--pink-dark)] to-[var(--pink)] transition-all duration-700"
              style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: item.count > 0 ? "4px" : "0" }}
            />
          </div>
          <span className="text-[9px] text-[var(--muted)] font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LanguageBarChart({ data }: { data: ChartData["languageData"] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const colors: Record<string, string> = { TR: "#ef4444", EN: "#3b82f6", RU: "#8b5cf6", "N/A": "#94a3b8" };

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.lang} className="flex items-center gap-3">
          <span className="text-xs font-semibold w-8 uppercase text-[var(--foreground)]">{item.lang}</span>
          <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                backgroundColor: colors[item.lang.toUpperCase()] || "#94a3b8",
                minWidth: item.count > 0 ? "12px" : "0",
              }}
            />
          </div>
          <span className="text-xs font-medium text-[var(--muted)] w-6 text-right">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function BookingCharts({ data }: { data: ChartData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Status Distribution */}
      <div className="bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Status Distribution</h3>
        <StatusDonutChart data={data.statusCounts} />
      </div>

      {/* Weekly Bookings */}
      <div className="bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Last 7 Days</h3>
        <WeeklyBarChart data={data.weeklyData} />
      </div>

      {/* Language Breakdown */}
      <div className="bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">By Language</h3>
        <LanguageBarChart data={data.languageData} />
      </div>
    </div>
  );
}
