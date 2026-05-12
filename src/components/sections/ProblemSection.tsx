interface ProblemSectionProps {
  t: {
    problem: {
      badge: string;
      headline: string;
      items: { icon: string; text: string }[];
    };
  };
}

const STATS = [
  { value: "3+", label: "Yıl Deneyim · Years exp. · лет опыта" },
  { value: "100+", label: "Mutlu öğrenci · Happy students · Довольных учеников" },
  { value: "TR/EN/RU", label: "Ders dili · Lesson language · Язык урока" },
];

export default function ProblemSection({ t }: ProblemSectionProps) {
  return (
    <section id="why" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div>
            <div className="section-badge">{t.problem.badge}</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight mb-6">
              {t.problem.headline.split("\n").map((line, i) => (
                <span key={i} className={i === 1 ? "block text-[var(--pink-dark)]" : "block"}>
                  {line}
                </span>
              ))}
            </h2>
            <div className="space-y-4 mt-8">
              {t.problem.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--pink-light)] border border-[var(--border)]">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm sm:text-base font-medium text-[var(--foreground)]">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: stats */}
          <div className="grid grid-cols-1 gap-6">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--pink-light)]"
              >
                <div className="text-4xl font-bold text-[var(--pink-dark)] mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
