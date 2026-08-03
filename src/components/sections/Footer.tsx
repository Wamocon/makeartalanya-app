import Image from "next/image";
import { ArrowUpRight, Send } from "lucide-react";
import type { Locale } from "@/i18n/translations";
import { OrbitMark } from "@/components/sections/OrbitMark";
import { InstagramMark } from "@/components/sections/BrandIcons";

interface FooterProps {
  t: {
    nav: { courses: string; gallery: string; booking: string; about: string };
    footer: {
      tagline: string;
      privacy: string;
      imprint: string;
      terms: string;
      rules: string;
      cookies: string;
      rights: string;
      navigation: string;
      legal: string;
    };
  };
  locale: Locale;
}

export default function Footer({ t }: FooterProps) {
  return (
    <footer className="future-grid-dark relative overflow-hidden bg-[#100d16] px-5 pb-8 pt-20 text-white sm:px-8 sm:pt-24 lg:px-10">
      <div className="absolute -right-28 top-0 size-96 rounded-full bg-[var(--blue)]/8 blur-[120px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-14 border-b border-white/12 pb-16 md:grid-cols-[1.2fr_0.65fr_0.65fr] lg:gap-24">
          <div className="max-w-md">
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center overflow-hidden rounded-xl bg-white">
                <Image src="/logo.jpg" alt="Make Art Studio" width={46} height={46} className="object-contain" />
              </span>
              <span>
                <span className="block text-base font-extrabold tracking-[-0.025em]">MAKE ART</span>
                <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.24em] text-white/38">Studio Alanya</span>
              </span>
            </div>
            <p className="mt-7 text-sm leading-7 text-white/54">{t.footer.tagline}</p>
            <div className="mt-8 flex items-center gap-4 text-[var(--pink)]">
              <OrbitMark className="size-9" />
              <span className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-white/38">Mahmutlar · Alanya · Antalya</span>
            </div>
          </div>

          <div>
            <h2 className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/32">{t.footer.navigation}</h2>
            <ul className="mt-6 grid gap-3 text-sm text-white/58">
              <li><a href="#courses" className="transition-colors hover:text-white">{t.nav.courses}</a></li>
              <li><a href="#gallery" className="transition-colors hover:text-white">{t.nav.gallery}</a></li>
              <li><a href="#booking" className="transition-colors hover:text-white">{t.nav.booking}</a></li>
              <li><a href="#about" className="transition-colors hover:text-white">{t.nav.about}</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/32">{t.footer.legal}</h2>
            <ul className="mt-6 grid gap-3 text-sm text-white/58">
              <li><a href="/privacy" className="transition-colors hover:text-white">{t.footer.privacy}</a></li>
              <li><a href="/terms" className="transition-colors hover:text-white">{t.footer.terms}</a></li>
              <li><a href="/rules" className="transition-colors hover:text-white">{t.footer.rules}</a></li>
              <li><a href="/cookies" className="transition-colors hover:text-white">{t.footer.cookies}</a></li>
              <li><a href="/imprint" className="transition-colors hover:text-white">{t.footer.imprint}</a></li>
              <li><a href="/admin/login" className="text-white/28 transition-colors hover:text-white">Admin</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 py-7 text-xs text-white/32 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Make Art Studio · {t.footer.rights}</span>
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com/make_art.tr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @make_art.tr"
              className="grid size-10 place-items-center rounded-xl border border-white/12 text-white/54 transition-colors hover:border-[var(--pink)] hover:text-[var(--pink)]"
            >
              <InstagramMark className="size-4" />
            </a>
            <a
              href="https://t.me/MakeArt_tr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram @MakeArt_tr"
              className="grid size-10 place-items-center rounded-xl border border-white/12 text-white/54 transition-colors hover:border-[var(--blue)] hover:text-[var(--blue)]"
            >
              <Send aria-hidden="true" className="size-4" />
            </a>
            <a href="#hero" aria-label="Back to top" className="ml-2 grid size-10 place-items-center rounded-xl bg-white text-[#17131e] transition-colors hover:bg-[var(--pink)] hover:text-white">
              <ArrowUpRight aria-hidden="true" className="size-4 -rotate-45" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
