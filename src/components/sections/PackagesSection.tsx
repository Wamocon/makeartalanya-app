import { packages, type Locale } from "@/i18n/translations";

interface PackagesProps {
  t: {
    packages: {
      badge: string;
      headline: string;
      popular: string;
      perLesson: string;
      buyNow: string;
      lessons: string;
      validity: string;
    };
  };
  locale: Locale;
}

export default function PackagesSection({ t }: PackagesProps) {
  return (
    <section id="courses" className="py-20 sm:py-28" style={{ background: "var(--pink-light)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="section-badge justify-center">{t.packages.badge}</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
            {t.packages.headline.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "block text-[var(--pink-dark)]" : "block"}>
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl p-5 sm:p-6 border transition-all hover:-translate-y-1 hover:shadow-lg ${
                pkg.popular
                  ? "bg-[var(--pink)] border-[var(--pink-dark)] text-white shadow-xl scale-105"
                  : "bg-white border-[var(--border)] text-[var(--foreground)]"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {t.packages.popular}
                </div>
              )}

              <div className={`text-3xl sm:text-4xl font-bold mb-1 ${pkg.popular ? "text-white" : "text-[var(--pink-dark)]"}`}>
                {pkg.lessons}
              </div>
              <div className={`text-sm mb-4 ${pkg.popular ? "text-white/80" : "text-[var(--muted)]"}`}>
                {t.packages.lessons}
              </div>

              <div className="mb-1">
                <span className="text-2xl font-bold">{pkg.pricePerLesson}€</span>
              </div>
              <div className={`text-xs mb-6 ${pkg.popular ? "text-white/70" : "text-[var(--muted)]"}`}>
                {t.packages.perLesson} · {t.packages.validity}
              </div>

              <a
                href="#booking"
                className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-full transition-all ${
                  pkg.popular
                    ? "bg-white text-[var(--pink-dark)] hover:bg-white/90"
                    : "bg-[var(--pink)] text-white hover:bg-[var(--pink-dark)]"
                }`}
              >
                {t.packages.buyNow}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
