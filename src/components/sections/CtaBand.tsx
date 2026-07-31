"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { type Locale } from "@/i18n/translations";
import { OrbitMark } from "@/components/sections/OrbitMark";

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
    <section className="relative overflow-hidden bg-[linear-gradient(120deg,#15112d_0%,#401745_48%,#0c4452_100%)] py-24 text-white sm:py-32 lg:py-36">
      <Image src="/images/hero/hero-painting.jpg" alt="" fill className="object-cover opacity-35" sizes="100vw" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,17,45,0.96)_0%,rgba(64,23,69,0.78)_52%,rgba(12,68,82,0.4)_100%)]" />
      <div className="future-grid-dark absolute inset-0 opacity-45" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <div className="mb-7 flex items-center gap-4 text-[var(--pink)]">
            <OrbitMark className="size-10" />
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.24em] text-white/54">{t.badge}</span>
          </div>
          <h2 className="font-display text-[clamp(3.2rem,8vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-white">{t.headline}</h2>
          <p className="mt-7 max-w-2xl border-l border-white/20 pl-5 text-base leading-7 text-white/66 sm:text-lg sm:leading-8">{t.sub}</p>
        </motion.div>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          href="/kayit"
          className="future-button min-w-52 bg-white text-[#17131e] hover:bg-[var(--pink)] hover:text-white"
        >
          {t.cta}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </motion.a>
      </div>
    </section>
  );
}
