"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Check, DoorOpen, PackageCheck, Palette } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";

interface TutorialSectionProps {
  t: {
    tutorial: {
      badge: string;
      headline: string;
      steps: { number: string; title: string; description: string; icon: string }[];
    };
  };
}

const STEP_ICONS = [PackageCheck, CalendarCheck, DoorOpen, Palette];
const STEP_ICON_TONES = [
  "border-[#ff6f88]/30 bg-[#ff6f88]/16 text-[#bd3655]",
  "border-[#12aeca]/30 bg-[#12aeca]/16 text-[#147b89]",
  "border-[#8b5bd6]/30 bg-[#8b5bd6]/15 text-[#6840aa]",
  "border-[#f49b18]/30 bg-[#f49b18]/17 text-[#a76708]",
];

export default function TutorialSection({ t }: TutorialSectionProps) {
  return (
    <section id="how-it-works" className="painted-section painted-section--canvas relative overflow-hidden py-28 sm:py-36 lg:py-44">
      <PaintedBackdrop tone="canvas" composition="sweep" />
      <div className="absolute inset-x-0 top-0 h-px bg-[var(--border)]" />
      <div className="relative z-[1] mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <SectionHeading label={t.tutorial.badge} title={t.tutorial.headline} />
          <p className="max-w-xl text-base leading-7 text-[var(--muted)] lg:justify-self-end">
            {t.tutorial.steps.map((step) => step.title).join(" · ")}
          </p>
        </div>

        <div className="relative mt-16 lg:mt-24">
          <div className="absolute left-5 right-5 top-6 hidden h-px bg-[linear-gradient(90deg,var(--pink),var(--blue))] opacity-35 md:block" aria-hidden="true" />
          <div className="grid gap-5 md:grid-cols-4" data-gsap-stagger>
            {t.tutorial.steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? Check;
              return (
                <motion.article
                  key={step.number}
                  whileHover={{ y: -5 }}
                  className="group relative border-t border-[var(--border)] pt-6 md:border-0 md:pt-0"
                >
                  <div className="relative z-10 mb-8 flex items-center justify-between md:block">
                    <span className={`grid size-12 place-items-center rounded-xl border shadow-[var(--shadow-sm)] transition-transform group-hover:-rotate-3 group-hover:scale-105 ${STEP_ICON_TONES[index]}`}>
                      <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
                    </span>
                    <span className="font-mono text-[0.66rem] font-bold tracking-[0.16em] text-[var(--muted)] md:mt-5 md:block">{step.number}</span>
                  </div>
                  <h3 className="max-w-[14rem] text-xl font-bold tracking-[-0.025em]">{step.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
