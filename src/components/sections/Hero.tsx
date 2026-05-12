interface HeroProps {
  t: {
    hero: {
      badge: string;
      headline: string;
      sub: string;
      cta: string;
      ctaSecondary: string;
    };
  };
}

export default function Hero({ t }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{
        background: `linear-gradient(135deg, var(--pink-light) 0%, #fff 50%, var(--blue-light) 100%)`,
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "var(--pink)" }}
      />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "var(--blue)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[var(--pink)] text-[var(--pink-dark)] text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-full mb-8 shadow-sm">
          <span>✦</span>
          {t.hero.badge}
          <span>✦</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] leading-tight mb-6">
          {t.hero.headline.split("\n").map((line, i) => (
            <span key={i} className={i === 1 ? "block text-[var(--pink-dark)]" : "block"}>
              {line}
            </span>
          ))}
        </h1>

        {/* Sub */}
        <p className="text-base sm:text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.hero.sub}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#booking"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--pink)] hover:bg-[var(--pink-dark)] text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
          >
            {t.hero.cta}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white border border-[var(--border)] text-[var(--foreground)] font-medium px-8 py-4 rounded-full transition-all text-base backdrop-blur-sm"
          >
            {t.hero.ctaSecondary}
          </a>
        </div>

        {/* Social proof bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["🎨", "🖌️", "✏️"].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[var(--pink-light)] border-2 border-white flex items-center justify-center text-xs">
                  {emoji}
                </div>
              ))}
            </div>
            <span>100+ öğrenci · students · учеников</span>
          </div>
          <div className="flex items-center gap-1">
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="text-[var(--pink)] text-sm">{s}</span>
            ))}
            <span className="ml-1">5.0 Instagram</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            <a
              href="https://instagram.com/make_art.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              @make_art.tr
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--muted)] text-xs animate-bounce">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
