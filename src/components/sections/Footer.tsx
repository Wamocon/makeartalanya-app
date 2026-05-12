import type { Locale } from "@/i18n/translations";

interface FooterProps {
  t: {
    footer: { tagline: string; privacy: string; imprint: string; rights: string };
  };
  locale: Locale;
}

export default function Footer({ t, locale: _locale }: FooterProps) {
  return (
    <footer className="bg-[var(--foreground)] text-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="font-bold text-lg mb-2">Make Art Studio</div>
            <div className="text-sm text-white/60">{t.footer.tagline}</div>
            <div className="mt-4 text-xs text-white/40">Alanya, Antalya, Türkiye</div>
          </div>

          {/* Links */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Links</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#courses" className="hover:text-white transition-colors">Kurslar / Courses / Курсы</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Galeri / Gallery / Галерея</a></li>
              <li><a href="#booking" className="hover:text-white transition-colors">Rezervasyon / Booking / Запись</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Legal</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</a></li>
              <li><a href="/imprint" className="hover:text-white transition-colors">{t.footer.imprint}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Make Art Studio · {t.footer.rights}</span>
          <a
            href="https://instagram.com/make_art.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/70 transition-colors"
          >
            Instagram @make_art.tr
          </a>
        </div>
      </div>
    </footer>
  );
}
