"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeroMedia } from "@/components/sections/HeroMedia";

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

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero({ t }: HeroProps) {
  const lines = t.hero.headline.split("\n");

  return (
    <section
      id="hero"
      className="grain relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Media background — poster now, real video is a drop-in later */}
      <HeroMedia poster="/images/hero/hero-art-studio.jpg" alt="Make Art Studio Alanya" />

      {/* Aurora glow (below the scrims) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <span
          className="aurora"
          style={{ width: "34rem", height: "34rem", top: "-6rem", right: "-4rem", background: "var(--pink-glow)" }}
        />
        <span
          className="aurora"
          style={{ width: "32rem", height: "32rem", bottom: "-8rem", left: "-6rem", background: "var(--blue-glow)", animationDelay: "-9s" }}
        />
      </div>
      {/* Legibility scrims: strong on the left (behind the copy) + up from the bottom */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      <div className="hero-scrim absolute inset-0 -z-10" />

      <div className="on-dark relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm"
          >
            <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-[var(--pink)]" />
            {t.hero.badge}
          </motion.div>

          <h1
            className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {lines.map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: "45%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: EASE }}
                className={i === 1 ? "block gradient-text-pink" : "block"}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="/kayit"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#1a1115] shadow-[var(--shadow-xl)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              {t.hero.cta}
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#courses"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>

          {/* Feature chips (painting / chess / crafts) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10 flex flex-wrap gap-2.5"
          >
            {t.hero.cards.map((card, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm"
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--pink)]" />
                {card.title}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div aria-hidden="true" className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
