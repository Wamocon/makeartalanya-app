"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Concierge } from "@/components/ai/Concierge";
import type { Locale } from "@/i18n/translations";

// The concierge is a visitor-facing helper — keep it off the staff/portal areas.
const HIDDEN_PREFIXES = ["/admin", "/my", "/auth", "/trainer"];

function readLocale(): Locale {
  if (typeof document === "undefined") return "tr";
  const cookie = document.cookie.match(/(?:^|; )lang=([^;]*)/)?.[1];
  if (cookie && ["tr", "en", "ru"].includes(cookie)) return cookie as Locale;
  const stored = localStorage.getItem("locale");
  if (stored && ["tr", "en", "ru"].includes(stored)) return stored as Locale;
  return "tr";
}

export function ConciergeMount() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>("tr");

  useEffect(() => {
    setLocale(readLocale());
    const sync = () => setLocale(readLocale());
    // Landing/language switchers dispatch "localechange"; also catch cross-tab + focus.
    window.addEventListener("localechange", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("localechange", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("visibilitychange", sync);
    };
  }, [pathname]);

  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return <Concierge locale={locale} />;
}
