"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import ProblemSection from "@/components/sections/ProblemSection";
import PackagesSection from "@/components/sections/PackagesSection";
import GallerySection from "@/components/sections/GallerySection";
import BookingSection from "@/components/sections/BookingSection";
import AboutSection from "@/components/sections/AboutSection";
import LocationSection from "@/components/sections/LocationSection";
import TutorialSection from "@/components/sections/TutorialSection";
import PortalSection from "@/components/sections/PortalSection";
import Footer from "@/components/sections/Footer";
import GsapProvider from "@/components/GsapProvider";
import { translations, type Locale } from "@/i18n/translations";

type ContentOverrides = Record<string, Record<string, string>>;

function deepMerge(base: Record<string, unknown>, overrides: ContentOverrides): Record<string, unknown> {
  const result = { ...base };
  for (const [section, fields] of Object.entries(overrides)) {
    if (typeof result[section] === "object" && result[section] !== null) {
      result[section] = { ...(result[section] as Record<string, unknown>) };
      for (const [field, value] of Object.entries(fields)) {
        if (value) (result[section] as Record<string, unknown>)[field] = value;
      }
    }
  }
  return result;
}

export default function Home() {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [overrides, setOverrides] = useState<Record<Locale, ContentOverrides | null>>({
    tr: null,
    en: null,
    ru: null,
  });

  // Read locale from URL ?lang= param or localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang && ["tr", "en", "ru"].includes(urlLang)) {
      setLocaleState(urlLang as Locale);
      localStorage.setItem("locale", urlLang);
      return;
    }
    const stored = localStorage.getItem("locale");
    if (stored && ["tr", "en", "ru"].includes(stored)) {
      setLocaleState(stored as Locale);
    }
  }, []);

  // Wrapper that persists locale choice
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState({}, "", url.toString());
  }, []);

  const loadOverrides = useCallback((l: Locale) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return;
    fetch(`${url}/storage/v1/object/public/content/${l}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setOverrides((prev) => ({ ...prev, [l]: data }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadOverrides(locale);
  }, [locale, loadOverrides]);

  const t = useMemo(() => {
    const base = translations[locale];
    const ov = overrides[locale];
    if (!ov) return base;
    return deepMerge(base as unknown as Record<string, unknown>, ov) as typeof base;
  }, [locale, overrides]);

  return (
    <GsapProvider>
      <main className="min-h-screen">
        <Navbar t={t} locale={locale} setLocale={setLocale} />
        <Hero t={t} />
        <ProblemSection t={t} />
        <TutorialSection t={t} />
        <PackagesSection t={t} locale={locale} />
        <GallerySection t={t} />
        <BookingSection t={t} locale={locale} />
        <PortalSection t={t} />
        <AboutSection t={t} />
        <LocationSection t={t} />
        <Footer t={t} locale={locale} />
      </main>
    </GsapProvider>
  );
}
