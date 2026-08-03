"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Brush, Palette, Sparkles } from "lucide-react";
import { HeroMedia } from "@/components/sections/HeroMedia";
import { OrbitMark } from "@/components/sections/OrbitMark";

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

const FEATURE_ICONS = [Palette, Sparkles, Brush];
const HERO_VIDEOS = [
  "/video/makeart-hero-v2.mp4",
  "/video/makeart-hero-purple-v2.mp4",
  "/video/makeart-hero-palette-v2.mp4",
];
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The headline size follows the longest line rather than being a fixed clamp.
 * A single clamp tuned for "Sevgiyle / Yarat" overflows the column once the
 * line gets longer — Cyrillic is the worst case, where "с любовью" runs far
 * wider than "Yarat" at the same font size and spilled past the hero cards.
 * Deriving the step from the character count keeps every translation on one
 * line, including ones added later.
 */
function headlineSize(lines: string[]) {
  // Character count alone is not enough: "с любовью" and "With Love" are both
  // nine characters, but the Cyrillic sets far wider and overflowed the column
  // at the size the Latin one needs. Weight Cyrillic so it drops a step.
  const width = (line: string) =>
    line.length * (/[Ѐ-ӿ]/.test(line) ? 1.2 : 1);

  const longest = Math.max(...lines.map(width));
  if (longest <= 8) return "clamp(4.5rem,12.5vw,10.5rem)";
  if (longest <= 10) return "clamp(3.3rem,9vw,7.75rem)";
  return "clamp(2.6rem,6.4vw,5.5rem)";
}

export default function Hero({ t }: HeroProps) {
  const lines = t.hero.headline.split("\n");

  return (
    <section id="hero" className="relative flex min-h-[760px] items-end overflow-hidden bg-[#17131e] text-white sm:min-h-screen">
      <HeroMedia
        videoSources={HERO_VIDEOS}
      />

      <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(10,8,14,0.88)_0%,rgba(10,8,14,0.58)_42%,rgba(10,8,14,0.08)_76%)]" />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(0deg,rgba(10,8,14,0.94)_0%,rgba(10,8,14,0.18)_55%,rgba(10,8,14,0.12)_100%)]" />
      <div className="future-grid-dark absolute inset-0 z-[2] opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-8 pt-32 sm:px-8 sm:pb-10 lg:px-10 lg:pb-12">
        <div className="grid items-end gap-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-7 text-[var(--pink)]"
            >
              <OrbitMark />
            </motion.div>

            <h1
              className="font-display font-semibold leading-[0.82] tracking-[-0.06em] text-white"
              style={{ fontSize: headlineSize(lines) }}
            >
              {lines.map((line, index) => (
                <motion.span
                  key={`${line}-${index}`}
                  initial={{ opacity: 0, y: 46 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.12 + index * 0.1, ease: EASE }}
                  /* nowrap is safe because the size above is chosen to fit — it
                     stops a long line breaking into a ragged third line. */
                  className={`block whitespace-nowrap ${index === 1 ? "ml-[0.12em] text-[var(--pink)]" : ""}`}
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42, ease: EASE }}
              className="mt-10 grid max-w-3xl gap-7 border-l border-white/20 pl-5 sm:grid-cols-[1fr_auto] sm:items-end sm:pl-7"
            >
              <p className="max-w-xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">{t.hero.sub}</p>
              <div className="flex flex-col gap-2.5 sm:min-w-56">
                <a href="/kayit" className="future-button bg-white text-[#17131e] hover:bg-[var(--pink)] hover:text-white">
                  {t.hero.cta}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
                <a href="#courses" className="future-button border border-white/22 bg-white/[0.07] text-white backdrop-blur-md hover:bg-white/14">
                  {t.hero.ctaSecondary}
                  <ArrowDown aria-hidden="true" className="size-4" />
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="hidden border-y border-white/16 lg:block"
          >
            {t.hero.cards.map((card, index) => {
              const Icon = FEATURE_ICONS[index] ?? Palette;
              return (
                <div key={card.title} className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-white/12 py-5 last:border-b-0">
                  <span className="grid size-12 place-items-center rounded-xl border border-white/15 bg-white/[0.07] text-[var(--blue)] transition-colors group-hover:border-[var(--blue)]/50 group-hover:bg-[var(--blue)]/10">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.65} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-white">{card.title}</span>
                    <span className="mt-1 block text-xs text-white/48">{card.sub}</span>
                  </span>
                  <span className="font-mono text-[0.62rem] text-white/32">0{index + 1}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
