"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/translations";

interface NavbarProps {
  t: { nav: { courses: string; gallery: string; booking: string; about: string; contact: string } };
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LOCALES: { value: Locale; flag: string; label: string }[] = [
  { value: "tr", flag: "🇹🇷", label: "TR" },
  { value: "en", flag: "🇬🇧", label: "EN" },
  { value: "ru", flag: "🇷🇺", label: "RU" },
];

export default function Navbar({ t, locale, setLocale }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">
            Make Art Studio
          </span>
          <span className="hidden sm:inline text-xs text-[var(--muted)] font-normal">· Alanya</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#courses" className="text-[var(--muted)] hover:text-[var(--pink-dark)] transition-colors">{t.nav.courses}</a>
          <a href="#gallery" className="text-[var(--muted)] hover:text-[var(--pink-dark)] transition-colors">{t.nav.gallery}</a>
          <a href="#about" className="text-[var(--muted)] hover:text-[var(--pink-dark)] transition-colors">{t.nav.about}</a>
          <a href="#contact" className="text-[var(--muted)] hover:text-[var(--pink-dark)] transition-colors">{t.nav.contact}</a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-[var(--pink-light)] rounded-full p-1">
            {LOCALES.map((l) => (
              <button
                key={l.value}
                onClick={() => setLocale(l.value)}
                className={`text-xs px-2.5 py-1 rounded-full transition-all font-medium ${
                  locale === l.value
                    ? "bg-[var(--pink)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#booking"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[var(--pink)] hover:bg-[var(--pink-dark)] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            {t.nav.booking}
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 text-[var(--muted)]"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--border)] px-4 pb-4 pt-2 flex flex-col gap-3">
          <a href="#courses" onClick={() => setMenuOpen(false)} className="text-sm text-[var(--foreground)] py-2 border-b border-[var(--border)]">{t.nav.courses}</a>
          <a href="#gallery" onClick={() => setMenuOpen(false)} className="text-sm text-[var(--foreground)] py-2 border-b border-[var(--border)]">{t.nav.gallery}</a>
          <a href="#about" onClick={() => setMenuOpen(false)} className="text-sm text-[var(--foreground)] py-2 border-b border-[var(--border)]">{t.nav.about}</a>
          <a href="#contact" onClick={() => setMenuOpen(false)} className="text-sm text-[var(--foreground)] py-2">{t.nav.contact}</a>
          <a
            href="#booking"
            onClick={() => setMenuOpen(false)}
            className="mt-2 text-center bg-[var(--pink)] text-white text-sm font-medium px-4 py-2.5 rounded-full"
          >
            {t.nav.booking}
          </a>
        </div>
      )}
    </header>
  );
}
