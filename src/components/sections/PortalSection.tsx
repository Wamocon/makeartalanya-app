"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, ChartNoAxesColumnIncreasing, Check, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { OrbitMark } from "@/components/sections/OrbitMark";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";

interface PortalSectionProps {
  t: {
    portal: {
      badge: string;
      headline: string;
      description: string;
      cta: string;
      features: string[];
    };
  };
}

const FEATURE_ICONS = [CalendarDays, ChartNoAxesColumnIncreasing, Sparkles];

export default function PortalSection({ t }: PortalSectionProps) {
  return (
    <section className="painted-section painted-section--aqua relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <PaintedBackdrop tone="aqua" flow="right" composition="sweep" />
      <div className="future-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative z-[1] mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-24 lg:px-10">
        <motion.div
          initial={{ opacity: 0.88, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionHeading label={t.portal.badge} title={t.portal.headline} description={t.portal.description} />

          <div className="mt-9 grid gap-2.5">
            {t.portal.features.map((feature, index) => {
              const Icon = FEATURE_ICONS[index] ?? Check;
              return (
                <div key={feature} className="flex items-center gap-3 border-b border-[var(--border)] py-3 text-sm font-semibold">
                  <Icon aria-hidden="true" className="size-4 text-[var(--blue-dark)]" strokeWidth={1.7} />
                  {feature}
                </div>
              );
            })}
          </div>

          <Link href="/auth/login" className="future-button mt-9 bg-[var(--foreground)] text-white hover:bg-[var(--blue-dark)]">
            {t.portal.cta}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0.88, y: 18, rotate: 0.6 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -left-8 -top-8 text-[var(--pink)]"><OrbitMark /></div>
          <div className="overflow-hidden rounded-[1.6rem] border border-[#463b86]/35 bg-[linear-gradient(145deg,#24194d_0%,#123c5c_48%,#6b245d_100%)] p-3 shadow-[0_36px_100px_rgba(35,24,83,0.28)] sm:p-4">
            <div className="rounded-[1.15rem] border border-white/12 bg-[#161832]/86 p-5 backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <span className="block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white/38">Make Art</span>
                  <span className="mt-1 block text-lg font-bold tracking-[-0.025em] text-white">{t.portal.badge}</span>
                </div>
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--pink)] text-white"><Sparkles aria-hidden="true" className="size-4" /></span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {t.portal.features.map((feature, index) => {
                  const Icon = FEATURE_ICONS[index] ?? Check;
                  return (
                    <div key={feature} className={`rounded-xl border border-white/12 p-4 ${index === 0 ? "bg-[#f43f8f]/16" : index === 1 ? "bg-[#00b8d9]/16" : "bg-[#ff9d1f]/16"}`}>
                      <Icon aria-hidden="true" className="size-5 text-[var(--blue)]" strokeWidth={1.55} />
                      <span className="mt-8 block text-sm font-bold text-white">{feature}</span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/8">
                        <span className={`block h-full rounded-full ${index === 1 ? "w-2/3 bg-[var(--blue)]" : index === 2 ? "w-1/2 bg-[var(--pink)]" : "w-4/5 bg-[var(--pink)]"}`} />
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/36">
                    <span>{t.portal.features[0]}</span><CalendarDays aria-hidden="true" className="size-4" />
                  </div>
                  <div className="mt-4 space-y-2">
                    {[0, 1, 2].map((item) => (
                      <span key={item} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.035] px-3 py-2.5">
                        <span className={`size-2 rounded-full ${item === 1 ? "bg-[var(--blue)]" : "bg-[var(--pink)]"}`} />
                        <span className="h-2 flex-1 rounded-full bg-white/12" />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex min-h-36 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(243,111,131,0.15),rgba(112,203,214,0.1))]">
                  <OrbitMark className="size-16 text-white/64" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
