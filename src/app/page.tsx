"use client";

import { useState } from "react";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import ProblemSection from "@/components/sections/ProblemSection";
import PackagesSection from "@/components/sections/PackagesSection";
import GallerySection from "@/components/sections/GallerySection";
import BookingSection from "@/components/sections/BookingSection";
import AboutSection from "@/components/sections/AboutSection";
import LocationSection from "@/components/sections/LocationSection";
import Footer from "@/components/sections/Footer";
import { translations, type Locale } from "@/i18n/translations";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("tr");
  const t = translations[locale];

  return (
    <main className="min-h-screen">
      <Navbar t={t} locale={locale} setLocale={setLocale} />
      <Hero t={t} />
      <ProblemSection t={t} />
      <PackagesSection t={t} locale={locale} />
      <GallerySection t={t} />
      <BookingSection t={t} locale={locale} />
      <AboutSection t={t} />
      <LocationSection t={t} />
      <Footer t={t} locale={locale} />
    </main>
  );
}
