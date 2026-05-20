import type { Locale } from "@/i18n/translations";
import Image from "next/image";

interface FooterProps {
  t: {
    nav: { courses: string; gallery: string; booking: string; about: string };
    footer: { tagline: string; privacy: string; imprint: string; rights: string; navigation: string; legal: string };
  };
  locale: Locale;
}

export default function Footer({ t, locale: _locale }: FooterProps) {
  return (
    <footer className="bg-[var(--foreground)] text-white py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-gradient-to-r from-[var(--pink)] to-[var(--blue)] opacity-5 blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="grid sm:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Image
                src="/logo.jpg"
                alt="MakeArt"
                width={160}
                height={56}
                className="object-contain rounded-lg bg-white p-2 shadow-sm"
                style={{ height: 56, width: "auto" }}
              />
            </div>
            <div className="text-sm text-white/50 leading-relaxed">{t.footer.tagline}</div>
            <div className="mt-3 text-xs text-white/30">Mahmutlar, Alanya, Antalya</div>
          </div>

          {/* Links */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/30 mb-4">{t.footer.navigation}</div>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><a href="#courses" className="hover:text-white transition-colors">{t.nav.courses}</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">{t.nav.gallery}</a></li>
              <li><a href="#booking" className="hover:text-white transition-colors">{t.nav.booking}</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">{t.nav.about}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/30 mb-4">{t.footer.legal}</div>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><a href="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</a></li>
              <li><a href="/imprint" className="hover:text-white transition-colors">{t.footer.imprint}</a></li>
              <li><a href="/admin/login" className="hover:text-white transition-colors opacity-50 hover:opacity-100">Admin</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <span>© {new Date().getFullYear()} MakeArt Studio · {t.footer.rights}</span>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/make_art.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              @make_art.tr
            </a>
            <a
              href="https://t.me/MakeArt_tr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              @MakeArt_tr
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
