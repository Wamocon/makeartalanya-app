"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";
import Logo from "@/components/Logo";
import type { Locale } from "@/i18n/translations";

interface NavbarProps {
  t: { nav: { courses: string; gallery: string; booking: string; about: string; contact: string } };
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LOCALES: Locale[] = ["tr", "en", "ru"];

export default function Navbar({ t, locale, setLocale }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const links = [
    { href: "#courses", label: t.nav.courses },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#about", label: t.nav.about },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`mx-auto max-w-7xl rounded-[1.15rem] border px-3 transition-all duration-300 sm:px-4 ${
          scrolled
            ? "border-black/10 bg-[#f8f7f4]/92 shadow-[0_20px_60px_rgba(15,12,21,0.12)] backdrop-blur-2xl"
            : "border-white/25 bg-[#17131e]/28 text-white shadow-[0_18px_70px_rgba(0,0,0,0.12)] backdrop-blur-xl"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="#hero" aria-label="Make Art Studio" className="flex shrink-0 items-center gap-3">
            <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white shadow-sm">
              <Logo size={34} variant="mark" className="rounded-lg" />
            </span>
            <span className="hidden leading-none min-[440px]:block">
              <span className="block text-sm font-extrabold tracking-[-0.025em]">MAKE ART</span>
              <span className={`mt-1 block text-[0.55rem] font-bold uppercase tracking-[0.24em] ${scrolled ? "text-black/42" : "text-white/54"}`}>
                Studio Alanya
              </span>
            </span>
          </a>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  scrolled ? "text-black/62 hover:bg-black/[0.045] hover:text-black" : "text-white/72 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <div className={`hidden items-center rounded-xl border p-1 sm:flex ${scrolled ? "border-black/8 bg-black/[0.035]" : "border-white/15 bg-white/[0.07]"}`}>
              {LOCALES.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-current={locale === item ? "true" : undefined}
                  onClick={() => setLocale(item)}
                  className={`min-h-9 min-w-9 rounded-lg px-2 text-[0.66rem] font-extrabold uppercase tracking-[0.08em] transition-colors ${
                    locale === item
                      ? scrolled
                        ? "bg-white text-[var(--foreground)] shadow-sm"
                        : "bg-white text-[#17131e] shadow-sm"
                      : scrolled
                        ? "text-black/45 hover:text-black"
                        : "text-white/52 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <Link
              href="/auth/login"
              aria-label="Student login"
              className={`grid size-11 place-items-center rounded-xl border transition-colors ${
                scrolled ? "border-black/10 text-black/62 hover:bg-black/[0.045] hover:text-black" : "border-white/18 text-white/72 hover:bg-white/10 hover:text-white"
              }`}
            >
              <UserRound aria-hidden="true" className="size-[1.05rem]" strokeWidth={1.8} />
            </Link>

            <Link
              href="/kayit"
              className={`hidden min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-extrabold transition-colors md:flex ${
                scrolled ? "bg-[var(--foreground)] text-white hover:bg-[#302a39]" : "bg-white text-[#17131e] hover:bg-white/88"
              }`}
            >
              {t.nav.booking}
              <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={`grid size-11 place-items-center rounded-xl border lg:hidden ${
                scrolled ? "border-black/10 text-black" : "border-white/18 text-white"
              }`}
            >
              {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <nav className={`grid gap-1 border-t py-3 ${scrolled ? "border-black/8" : "border-white/14"}`}>
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${scrolled ? "hover:bg-black/[0.04]" : "hover:bg-white/10"}`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-2 flex gap-2 sm:hidden">
                  {LOCALES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLocale(item)}
                      className={`min-h-11 flex-1 rounded-xl border text-xs font-bold uppercase ${
                        locale === item ? "border-[var(--pink)] bg-[var(--pink)] text-white" : scrolled ? "border-black/10" : "border-white/18"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
