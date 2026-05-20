"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface HeroProps {
  t: {
    hero: {
      badge: string;
      headline: string;
      sub: string;
      cta: string;
      ctaSecondary: string;
      cards: { title: string; sub: string }[];
    };
  };
}

export default function Hero({ t }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--pink-glow)" }}
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--blue-glow)" }}
        />
        <motion.div
          animate={{ y: [-10, 15, -10], x: [-5, 10, -5] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[60%] w-48 h-48 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--pink-glow)" }}
        />
        
        {/* Playful floating activity icons */}
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[12%]"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" className="opacity-20">
            <circle cx="24" cy="24" r="20" fill="var(--pink)" />
            <path d="M16 32l4-12 4 6 4-8 4 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [10, -20, 10], rotate: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[30%] right-[8%]"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-15">
            <rect x="4" y="4" width="32" height="32" rx="6" fill="var(--blue)" />
            <path d="M12 28l4-4 4 2 4-6 4 8" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="14" cy="16" r="3" fill="white" opacity="0.8" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [-8, 12, -8], x: [5, -5, 5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[25%] left-[20%]"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" className="opacity-15">
            <path d="M18 2l4 8 9 1.5-6.5 6.5 1.5 9L18 22l-8 5 1.5-9L5 11.5 14 10z" fill="var(--pink-dark)" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[35%] right-[15%]"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" className="opacity-12">
            <polygon points="16,2 20,12 30,12 22,18 24,28 16,22 8,28 10,18 2,12 12,12" fill="var(--blue)" />
          </svg>
        </motion.div>
        
        {/* Small decorative dots */}
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[25%] left-[40%] w-4 h-4 rounded-full bg-[var(--pink)] opacity-30"
        />
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [360, 180, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-[60%] right-[20%] w-3 h-3 rounded-full bg-[var(--blue)] opacity-40"
        />
        <motion.div
          animate={{ y: [-8, 12, -8] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] right-[35%] w-2 h-2 rounded-full bg-[var(--pink-dark)] opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="section-badge mx-auto lg:mx-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--pink)] animate-pulse" />
              {t.hero.badge}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] leading-[1.1] mb-6 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t.hero.headline.split("\n").map((line, i) => (
                <span key={i} className={i === 1 ? "block bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] bg-clip-text text-transparent" : "block"}>
                  {line}
                </span>
              ))}
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-[var(--muted)] max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light"
            >
              {t.hero.sub}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
              <motion.a
                href="#booking"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[var(--foreground)] text-white font-semibold px-8 py-4 rounded-full transition-all shadow-[var(--shadow-lg)] text-base"
              >
                {t.hero.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.a>
              <motion.a
                href="#courses"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass border border-[var(--border)] text-[var(--foreground)] font-medium px-8 py-4 rounded-full transition-all text-base hover:shadow-[var(--shadow-md)]"
              >
                {t.hero.ctaSecondary}
              </motion.a>
            </motion.div>

            {/* Social proof bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-sm text-[var(--muted)]"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                  ].map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt="Student"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ))}
                </div>
                <span className="font-medium">100+ students</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 font-medium">5.0</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <a
                  href="https://instagram.com/make_art.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)] transition-colors font-medium"
                >
                  @make_art.tr
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right: Hero Illustration / Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main hero image */}
              <div className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl border border-white/50">
                <Image
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop"
                  alt="Colorful art studio painting"
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating activity cards */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-6 top-[20%] bg-white rounded-2xl shadow-xl border border-[var(--border)] p-3 flex items-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">{t.hero.cards[0].title}</div>
                  <div className="text-[10px] text-[var(--muted)]">{t.hero.cards[0].sub}</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [6, -10, 6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-4 top-[40%] bg-white rounded-2xl shadow-xl border border-[var(--border)] p-3 flex items-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h4v4H4V4zm0 6h4v4H4v-4zm0 6h4v4H4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm6-6h4v4h-4V4z" opacity="0.3" />
                    <path d="M10 16h4v4h-4v-4zm6 0h4v4h-4v-4zm0-6h4v4h-4v-4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">{t.hero.cards[1].title}</div>
                  <div className="text-[10px] text-[var(--muted)]">{t.hero.cards[1].sub}</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [-5, 10, -5] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute left-[10%] -bottom-2 bg-white rounded-2xl shadow-xl border border-[var(--border)] p-3 flex items-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">{t.hero.cards[2].title}</div>
                  <div className="text-[10px] text-[var(--muted)]">{t.hero.cards[2].sub}</div>
                </div>
              </motion.div>

              {/* Background decoration circle */}
              <div className="absolute -z-10 -inset-8 rounded-full bg-gradient-to-br from-pink-100/50 to-blue-100/50 blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex items-start justify-center p-1.5"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-[var(--pink)]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
