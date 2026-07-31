"use client";

import { motion } from "framer-motion";
import { Languages, Palette, Sparkles, UsersRound } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";

interface ProblemSectionProps {
  t: {
    problem: {
      badge: string;
      headline: string;
      items: { icon: string; text: string }[];
      stats: { value: string; label: string; icon: string }[];
    };
  };
}
const BENEFIT_ICONS = [Palette, Sparkles, Languages];
const BENEFIT_TONES = [
  "border-[#f25c7a]/30 bg-[#f25c7a]/14 text-[#bd3655]",
  "border-[#13abc5]/30 bg-[#13abc5]/14 text-[#177d8c]",
  "border-[#8a5bd1]/30 bg-[#8a5bd1]/14 text-[#6740a4]",
];

export default function ProblemSection({ t }: ProblemSectionProps) {
  return (
    <section id="why" className="painted-section painted-section--rose relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <PaintedBackdrop tone="rose" flow="right" composition="burst" />
      <div className="future-grid absolute inset-0 opacity-55" aria-hidden="true" />
      <div className="absolute -right-24 top-20 size-80 rounded-full bg-[var(--blue)]/12 blur-[90px]" aria-hidden="true" />

      <div className="relative z-[1] mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-24">
          <motion.div
            initial={{ opacity: 0.88, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading label={t.problem.badge} title={t.problem.headline} />
            <div className="mt-12 flex items-center gap-4 text-[var(--muted)]">
              <span className="future-icon text-[var(--pink-dark)]"><UsersRound aria-hidden="true" className="size-5" strokeWidth={1.65} /></span>
              <span className="max-w-xs text-sm leading-6">Make Art Studio · Mahmutlar, Alanya</span>
            </div>
          </motion.div>

          <div className="border-t border-[var(--border)]">
            {t.problem.items.map((item, index) => {
              const Icon = BENEFIT_ICONS[index] ?? Sparkles;
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0.88, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-70px" }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="group grid grid-cols-[3rem_1fr_auto] items-center gap-5 border-b border-[var(--border)] py-7 sm:grid-cols-[4rem_1fr_auto] sm:py-9"
                >
                  <span className={`inline-flex size-12 items-center justify-center rounded-[0.95rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform group-hover:-rotate-3 group-hover:scale-105 ${BENEFIT_TONES[index]}`}>
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
                  </span>
                  <p className="text-base font-semibold leading-6 tracking-[-0.015em] sm:text-xl">{item.text}</p>
                  <span className="font-mono text-[0.65rem] text-[var(--muted)]/55">0{index + 1}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0.88, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid border-y border-[var(--border)] sm:grid-cols-3 lg:mt-28"
        >
          {t.problem.stats.map((stat, index) => (
            <div key={stat.label} className="relative px-2 py-7 sm:px-8 sm:py-9 sm:not-last:border-r sm:not-last:border-[var(--border)]">
              <span className="font-display text-5xl font-semibold tracking-[-0.055em] text-[var(--foreground)] sm:text-6xl">{stat.value}</span>
              <span className="mt-2 block max-w-44 text-xs font-bold uppercase leading-5 tracking-[0.14em] text-[var(--muted)]">{stat.label}</span>
              <span className={`absolute right-4 top-5 size-2 rounded-full ${index === 1 ? "bg-[var(--blue)]" : "bg-[var(--pink)]"}`} aria-hidden="true" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
