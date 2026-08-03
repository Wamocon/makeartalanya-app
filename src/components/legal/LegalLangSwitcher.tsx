"use client";

/**
 * Language switcher for the legal pages.
 *
 * The legal pages are server components that read the `lang` cookie through
 * `getLocale()`. Nothing on those pages could change that cookie before, so a
 * visitor who arrived directly on /privacy was stuck with whatever the cookie
 * happened to say (or the "en" fallback). A KVKK notice and the participation
 * terms have to be readable in the language the parent actually understands,
 * so every legal page carries this control.
 *
 * Writing the cookie is not enough on its own — the markup was rendered on the
 * server, so we `router.refresh()` to re-render it in the new language.
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/translations";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

const ARIA_LABEL: Record<Locale, string> = {
  tr: "Dil seçimi",
  en: "Language selection",
  ru: "Выбор языка",
};

export function LegalLangSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchLocale(code: Locale) {
    if (code === current) return;
    document.cookie = `lang=${code};path=/;max-age=31536000;SameSite=Lax`;
    if (typeof localStorage !== "undefined") localStorage.setItem("locale", code);
    window.dispatchEvent(new CustomEvent("localechange", { detail: code }));
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={ARIA_LABEL[current]}
      aria-busy={pending}
      className="inline-flex gap-1 rounded-full border border-[var(--border)] bg-white p-1 shadow-[var(--shadow-sm)]"
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLocale(code)}
          aria-pressed={code === current}
          className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
            code === current
              ? "bg-[var(--pink-dark)] text-white"
              : "text-[var(--muted)] hover:bg-[var(--pink-light)]/60 hover:text-[var(--foreground)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
