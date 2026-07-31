"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Infinity as InfinityIcon, Sparkles, TicketCheck } from "lucide-react";
import { packages, type Locale } from "@/i18n/translations";

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
const CARD_SURFACES = ["#def7fa", "#fff1c9", "#ebe2ff", "#f56a83", "#e1f7e7", "#ffe3d5"];
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
    <section
      id="courses"
      className="relative isolate overflow-hidden py-20 text-white sm:py-24 lg:py-28"
      style={{
        backgroundColor: "#17131e",
        backgroundImage:
          "radial-gradient(circle at 9% 12%, rgba(243,67,128,0.24), transparent 30%), radial-gradient(circle at 91% 78%, rgba(0,184,217,0.2), transparent 32%)",
      }}
    >
      <div className="future-grid-dark absolute inset-0 opacity-45" aria-hidden="true" />
      <div className="absolute -left-28 top-16 size-[28rem] rounded-full bg-[var(--pink)]/14 blur-[140px]" aria-hidden="true" />
      <div className="absolute -right-24 bottom-0 size-[26rem] rounded-full bg-[var(--blue)]/10 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div data-testid="packages-intro" className="grid gap-8 overflow-hidden rounded-[2rem] border border-white/12 bg-[#211a2b]/95 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-sm sm:p-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:p-12">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-[#ff8da2]">
              <span className="h-0.5 w-9 rounded-full bg-current" aria-hidden="true" />
              {t.packages.badge}
            </div>
            <h2 className="max-w-4xl font-display text-[clamp(2.65rem,5.8vw,5.7rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-white drop-shadow-[0_3px_22px_rgba(0,0,0,0.28)]">
              {t.packages.headline.split("\n").map((line, index) => (
                <span key={`${line}-${index}`} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <div className="rounded-[1.4rem] border border-[#78dce8]/35 bg-[#78dce8]/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#78dce8] text-[#17131e] shadow-[0_10px_30px_rgba(120,220,232,0.24)]">
                <InfinityIcon aria-hidden="true" className="size-5" strokeWidth={2.1} />
              </span>
              <div>
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[#a9edf4]">Make Art Pass</p>
                <p className="mt-1 text-base font-bold text-white">{t.packages.validity}</p>
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
                    className="object-cover saturate-[1.18] contrast-[1.06] brightness-[1.03] transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17131e]/72 via-[#17131e]/8 to-transparent" aria-hidden="true" />
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
