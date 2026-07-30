"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n/translations";
import Logo from "@/components/Logo";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#courses", label: t.nav.courses },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#about", label: t.nav.about },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl transition-all duration-500 rounded-full px-2 ${
        scrolled
          ? "glass-strong shadow-[var(--shadow-lg)]"
          : "glass shadow-[var(--shadow-sm)]"
      }`}
    >
      <div className="h-14 flex items-center justify-between px-4 sm:px-5">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Logo size={48} variant="full" />
        </motion.a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 bg-white/40 rounded-full p-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-full hover:bg-white/60"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="hidden sm:flex items-center gap-0.5 bg-white/60 border border-[var(--border)] rounded-full p-1">
            {LOCALES.map((l) => (
              <button
                key={l.value}
                onClick={() => setLocale(l.value)}
                className={`text-[11px] px-2.5 py-1.5 rounded-full transition-all font-semibold ${
                  locale === l.value
                    ? "bg-[var(--foreground)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/60"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Login */}
          <Link href="/auth/login">
            <span className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/60 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white transition-all">
              <User className="w-4 h-4" />
            </span>
          </Link>

          {/* CTA */}
          <motion.a
            href="/kayit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[var(--foreground)] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
          >
            {t.nav.booking}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/60 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden absolute top-full left-0 right-0 mt-3 glass-strong rounded-3xl shadow-[var(--shadow-xl)] overflow-hidden"
          >
            <div className="px-3 pb-4 pt-3 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-sm font-medium text-[var(--foreground)] py-3 px-4 rounded-2xl hover:bg-[var(--pink-light)]/60 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="/kayit"
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-center bg-[var(--foreground)] text-white text-sm font-semibold px-5 py-3 rounded-full"
              >
                {t.nav.booking}
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
