"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Infinity as InfinityIcon, Sparkles, TicketCheck } from "lucide-react";
import { packages, type Locale } from "@/i18n/translations";
import { SectionHeading } from "@/components/sections/SectionHeading";

interface PackagesProps {
  t: {
    packages: {
      badge: string;
      headline: string;
      popular: string;
      perLesson: string;
      buyNow: string;
      lessons: string;
      validity: string;
    };
  };
  locale: Locale;
}

const CARD_ACCENTS = ["#78dce8", "#ffc857", "#b9a6ff", "#f56a83", "#9de0ad", "#ff9f68"];
const CARD_SURFACES = ["#eefbfc", "#fff8e7", "#f4f0ff", "#f56a83", "#effaf1", "#fff1e9"];
const CARD_ACTIONS = ["#197f8d", "#aa6a00", "#7058c8", "#d84f70", "#2f864b", "#c65b2c"];
const PACKAGE_PRICES: Record<number, number> = {
  1: 45,
  2: 42,
  4: 40,
  8: 37,
  12: 35,
  16: 32,
};

// Curated free photos from Unsplash, delivered through Next.js image optimization.
const PACKAGE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1758522275513-fe5614800192?auto=format&fit=crop&w=1000&q=82",
    alt: "Artist painting on a canvas in a studio",
  },
  {
    src: "https://images.unsplash.com/photo-1772442164872-15d54199f0e0?auto=format&fit=crop&w=1000&q=82",
    alt: "Artist working with a paint palette",
  },
  {
    src: "https://images.unsplash.com/photo-1753098498106-0319c1d646ca?auto=format&fit=crop&w=1000&q=82",
    alt: "Student painting during an art class",
  },
  {
    src: "https://images.unsplash.com/photo-1677064731557-da73521052be?auto=format&fit=crop&w=1000&q=82",
    alt: "Colorful paintbrush and artist palette",
  },
  {
    src: "https://images.unsplash.com/photo-1774820270817-d5003075461d?auto=format&fit=crop&w=1000&q=82",
    alt: "Paint brushes and a colorful artist palette",
  },
  {
    src: "https://images.unsplash.com/photo-1646182945477-bbd5c6c92a57?auto=format&fit=crop&w=1000&q=82",
    alt: "Watercolor artwork with brushes and paint",
  },
];

const SUPPORTING_COPY: Record<Locale, { pass: string; total: string; save: string; single: string; priceDetail: string }> = {
  tr: {
    pass: "stüdyo kartı",
    total: "Paket toplamı",
    save: "ders başına tasarruf",
    single: "Tek ders, tam esneklik",
    priceDetail: "Referans fiyat; güncel TL toplamı sözleşmeden önce teyit edilir.",
  },
  en: {
    pass: "studio pass",
    total: "Package total",
    save: "saved per lesson",
    single: "One class, full flexibility",
    priceDetail: "Reference price; the current TRY total is confirmed before contract.",
  },
  ru: {
    pass: "абонемент",
    total: "Стоимость пакета",
    save: "экономия за урок",
    single: "Один урок, полная свобода",
    priceDetail: "Справочная цена; итог в TRY подтверждается до договора.",
  },
};

export default function PackagesSection({ t, locale }: PackagesProps) {
  const copy = SUPPORTING_COPY[locale];

  return (
    <section id="courses" className="relative overflow-hidden bg-[#17131e] py-24 text-white sm:py-32 lg:py-40">
      <div className="future-grid-dark absolute inset-0 opacity-45" aria-hidden="true" />
      <div className="absolute -left-28 top-16 size-[28rem] rounded-full bg-[var(--pink)]/14 blur-[140px]" aria-hidden="true" />
      <div className="absolute -right-24 bottom-0 size-[26rem] rounded-full bg-[var(--blue)]/10 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 border-b border-white/14 pb-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:pb-16">
          <SectionHeading label={t.packages.badge} title={t.packages.headline} tone="dark" />
          <div className="rounded-[1.4rem] border border-white/14 bg-white/[0.055] p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--blue)] text-[#17131e]">
                <InfinityIcon aria-hidden="true" className="size-5" strokeWidth={2.1} />
              </span>
              <div>
                <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-white/42">Make Art Pass</p>
                <p className="mt-1 text-sm font-semibold text-white/88">{t.packages.validity}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5" data-gsap-stagger>
          {packages.map((pkg, index) => {
            const isPopular = Boolean(pkg.popular);
            const pricePerLesson = PACKAGE_PRICES[pkg.lessons] ?? PACKAGE_PRICES[1];
            const packageTotal = pkg.lessons * pricePerLesson;
            const savingPerLesson = PACKAGE_PRICES[1] - pricePerLesson;

            return (
              <motion.article
                key={pkg.id}
                whileHover={{ y: -7 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative flex min-h-[31rem] flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_22px_80px_rgba(0,0,0,0.16)] sm:p-7 ${
                  isPopular
                    ? "border-[#ff8da2] bg-[linear-gradient(145deg,#f56a83_0%,#d84f70_100%)] text-white"
                    : "border-white/80 text-[#17131e]"
                }`}
                style={isPopular ? undefined : { backgroundColor: CARD_SURFACES[index] }}
              >
                <div
                  className="absolute inset-x-7 top-0 h-1 rounded-b-full"
                  style={{ backgroundColor: isPopular ? "#ffffff" : CARD_ACCENTS[index] }}
                  aria-hidden="true"
                />
                <div
                  className={`absolute -right-16 -top-16 size-44 rounded-full blur-3xl ${isPopular ? "bg-white/18" : "opacity-20"}`}
                  style={isPopular ? undefined : { backgroundColor: CARD_ACCENTS[index] }}
                  aria-hidden="true"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.18em] ${isPopular ? "bg-white text-[#b93557]" : "bg-[#17131e] text-white"}`}>
                    {isPopular ? <Sparkles aria-hidden="true" className="size-3" /> : <TicketCheck aria-hidden="true" className="size-3" />}
                    {isPopular ? t.packages.popular : `${String(index + 1).padStart(2, "0")} · ${copy.pass}`}
                  </div>
                  <span className={`font-mono text-xs ${isPopular ? "text-white/52" : "text-black/28"}`}>MA/{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="relative mt-7 h-36 overflow-hidden rounded-[1.15rem] bg-[#25202c]">
                  <Image
                    src={PACKAGE_IMAGES[index].src}
                    alt={PACKAGE_IMAGES[index].alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17131e]/90 via-[#17131e]/18 to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-4 bottom-3 flex items-end gap-2 text-white">
                    <span className="font-display text-[4.7rem] font-semibold leading-[0.7] tracking-[-0.075em] drop-shadow-lg">{pkg.lessons}</span>
                    <span className="pb-1 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-white/74">{t.packages.lessons}</span>
                  </div>
                </div>

                <div className={`relative mt-5 border-t pt-5 ${isPopular ? "border-white/24" : "border-black/10"}`}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <span className="text-3xl font-black tracking-[-0.045em]">€{pricePerLesson}</span>
                      <span className={`ml-2 text-xs ${isPopular ? "text-white/68" : "text-black/48"}`}>/ {t.packages.perLesson}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-[0.55rem] font-extrabold uppercase tracking-[0.15em] ${isPopular ? "text-white/56" : "text-black/38"}`}>{copy.total}</p>
                      <p className="mt-1 text-sm font-black">€{packageTotal}</p>
                    </div>
                  </div>
                  <div className={`mt-4 flex items-center gap-2 text-xs font-semibold ${isPopular ? "text-white/80" : "text-black/58"}`}>
                    <Check aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.4} />
                    {savingPerLesson > 0 ? `€${savingPerLesson} ${copy.save}` : copy.single}
                  </div>
                  <p className={`mt-3 text-[0.68rem] leading-relaxed ${isPopular ? "text-white/60" : "text-black/42"}`}>{copy.priceDetail}</p>
                </div>

                <a
                  href="/kayit"
                  className={`relative mt-auto flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-extrabold transition-transform group-hover:translate-x-0.5 ${
                    isPopular ? "bg-white text-[#b93557]" : "text-white"
                  }`}
                  style={isPopular ? undefined : { backgroundColor: CARD_ACTIONS[index] }}
                  aria-label={`${t.packages.buyNow}: ${pkg.lessons} ${t.packages.lessons}`}
                >
                  {t.packages.buyNow}
                  <span className={`grid size-8 place-items-center rounded-lg ${isPopular ? "bg-[#f56a83] text-white" : "bg-white/15"}`}>
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </a>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
