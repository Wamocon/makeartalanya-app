"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { type Locale } from "@/i18n/translations";

const COPY: Record<Locale, { badge: string; headline: string; sub: string; cta: string }> = {
  tr: {
    badge: "Ücretsiz Deneme Dersi",
    headline: "Sanata bugün başlayın",
    sub: "Çocuğunuz için ilk adım burada. Ücretsiz deneme dersiyle stüdyoyu ve öğretmeni tanıyın.",
    cta: "Kayıt Ol",
  },
  en: {
    badge: "Free Trial Lesson",
    headline: "Start creating today",
    sub: "Your child's first step starts here. Meet the studio and teacher with a free trial lesson.",
    cta: "Register",
  },
  ru: {
    badge: "Бесплатное пробное занятие",
    headline: "Начните творить сегодня",
    sub: "Первый шаг вашего ребёнка здесь. Познакомьтесь со студией и преподавателем на бесплатном пробном занятии.",
    cta: "Записаться",
  },
};

export default function CtaBand({ locale }: { locale: Locale }) {
  const t = COPY[locale] ?? COPY.tr;

  return (
    <section className="grain relative overflow-hidden bg-[#140c10] py-24 sm:py-32">
      <Image src="/images/hero/hero-painting.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#140c10]/85 via-[#140c10]/70 to-[#140c10]/95" />
      <div className="pointer-events-none absolute inset-0">
        <span aria-hidden="true" className="aurora" style={{ width: "30rem", height: "30rem", top: "-6rem", left: "10%", background: "var(--pink-glow)" }} />
        <span aria-hidden="true" className="aurora" style={{ width: "28rem", height: "28rem", bottom: "-8rem", right: "8%", background: "var(--blue-glow)", animationDelay: "-10s" }} />
      </div>

      <div className="on-dark relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0.85, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white/90"
        >
          <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-[var(--pink)]" />
          {t.badge}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0.85, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0.85, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80"
        >
          {t.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0.85, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9"
        >
          <a
            href="/kayit"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#1a1115] shadow-[var(--shadow-xl)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            {t.cta}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
