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

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass shadow-[var(--shadow-md)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Logo size={56} variant="full" />
        </motion.a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "#courses", label: t.nav.courses },
            { href: "#gallery", label: t.nav.gallery },
            { href: "#about", label: t.nav.about },
            { href: "#contact", label: t.nav.contact },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-full hover:bg-[var(--pink-light)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-0.5 bg-[var(--background)] border border-[var(--border)] rounded-full p-1">
            {LOCALES.map((l) => (
              <motion.button
                key={l.value}
                onClick={() => setLocale(l.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-xs px-2.5 py-1.5 rounded-full transition-all font-medium ${
                  locale === l.value
                    ? "bg-[var(--pink)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {l.label}
              </motion.button>
            ))}
          </div>

          {/* Login */}
          <Link href="/auth/login">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2.5 rounded-full hover:bg-[var(--pink-light)] transition-all"
            >
              <User className="w-4 h-4" />
            </motion.span>
          </Link>

          {/* CTA */}
          <motion.a
            href="#booking"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[var(--foreground)] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-[var(--shadow-md)]"
          >
            {t.nav.booking}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-[var(--pink-light)] transition-colors"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden glass border-t border-[var(--border)] overflow-hidden"
          >
            <div className="px-4 pb-5 pt-3 flex flex-col gap-1">
              {[
                { href: "#courses", label: t.nav.courses },
                { href: "#gallery", label: t.nav.gallery },
                { href: "#about", label: t.nav.about },
                { href: "#contact", label: t.nav.contact },
              ].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-sm font-medium text-[var(--foreground)] py-3 px-3 rounded-xl hover:bg-[var(--pink-light)] transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="#booking"
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-3 text-center bg-[var(--foreground)] text-white text-sm font-semibold px-5 py-3 rounded-full"
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
