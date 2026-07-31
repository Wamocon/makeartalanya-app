"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { type Locale } from "@/i18n/translations";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";
import { CircleCheckBig } from "lucide-react";

interface BookingProps {
  t: {
    booking: {
      badge: string;
      headline: string;
      name: string;
      phone: string;
      language: string;
      submit: string;
      consent: string;
      privacy: string;
      nonBinding: string;
      terms: string;
      success: string;
      errorGeneric: string;
      errorNetwork: string;
    };
  };
  locale: Locale;
}

const LANGUAGES = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

export default function BookingSection({ t, locale }: BookingProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    language: locale,
    isTrial: false,
    privacyNoticeAccepted: false,
    termsAccepted: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error || t.booking.errorGeneric);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setForm({
        name: "",
        phone: "",
        language: locale,
        isTrial: false,
        privacyNoticeAccepted: false,
        termsAccepted: false,
      });
    } catch {
      setError(t.booking.errorNetwork);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="booking" className="painted-section painted-section--rose relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <PaintedBackdrop tone="rose" composition="palette" />
      <div className="future-grid absolute inset-0 opacity-45" aria-hidden="true" />
      <div className="absolute -right-32 top-24 size-96 rounded-full bg-[var(--blue)]/14 blur-[110px]" aria-hidden="true" />
      
      <motion.div
        initial={{ opacity: 0.9, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-[1] mx-auto max-w-5xl px-5 sm:px-8 lg:px-10"
      >
        <SectionHeading label={t.booking.badge} title={t.booking.headline} align="center" className="mb-14" />

        <div className="future-surface relative overflow-hidden rounded-[1.75rem] p-5 sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--pink),var(--blue))]" aria-hidden="true" />
          {submitted ? (
            <div className="py-10 text-center">
              <CircleCheckBig aria-hidden="true" className="mx-auto mb-5 size-12 text-[var(--pink-dark)]" strokeWidth={1.45} />
              <p className="text-lg font-medium text-[var(--foreground)]">{t.booking.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide">
                  {t.booking.name} *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm transition-colors focus:border-[var(--pink)] focus:outline-none"
                  placeholder="Anna Müller"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide">
                  {t.booking.phone} *
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm transition-colors focus:border-[var(--pink)] focus:outline-none"
                  placeholder="+90 5xx xxx xx xx"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide">
                  {t.booking.language}
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value as Locale })}
                  className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm transition-colors focus:border-[var(--pink)] focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Trial class option */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--pink)] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isTrial}
                  onChange={(e) => setForm({ ...form, isTrial: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#DCA8B2]"
                />
                <div>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {locale === "tr" ? "🎨 Deneme Dersi İstiyorum" : locale === "ru" ? "🎨 Хочу пробный урок" : "🎨 I want a Trial Class"}
                  </span>
                  <span className="block text-[11px] text-[var(--muted)]">
                    {locale === "tr" ? "Ücretsiz ilk ders" : locale === "ru" ? "Бесплатный первый урок" : "Free first lesson"}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white p-4 text-sm leading-relaxed text-[var(--muted)] sm:col-span-2">
                <input
                  required
                  type="checkbox"
                  checked={form.privacyNoticeAccepted}
                  onChange={(e) => setForm({ ...form, privacyNoticeAccepted: e.target.checked })}
                  className="mt-0.5 size-4 shrink-0 rounded accent-[#DCA8B2]"
                />
                <span>
                  {t.booking.consent}{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--pink-dark)] underline hover:text-[var(--pink)]"
                  >
                    {t.booking.privacy}
                  </Link>
                  <span className="text-[var(--pink-dark)]"> *</span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white p-4 text-sm leading-relaxed text-[var(--muted)] sm:col-span-2">
                <input
                  required
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                  className="mt-0.5 size-4 shrink-0 rounded accent-[#DCA8B2]"
                />
                <span>
                  {locale === "tr"
                    ? "Bağlayıcı olmayan rezervasyon talebine ilişkin ön bilgilendirmeyi okudum:"
                    : locale === "ru"
                      ? "Я прочитал(а) информацию об услуге для этого необязывающего запроса:"
                      : "I have read the service information for this non-binding booking request:"}{" "}
                  <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--pink-dark)] underline">
                    {t.booking.terms}
                  </Link>
                  <span className="text-[var(--pink-dark)]"> *</span>
                </span>
              </label>

              <p className="px-1 text-xs leading-relaxed text-[var(--muted)] sm:col-span-2">{t.booking.nonBinding}</p>

              <button
                type="submit"
                disabled={loading || !form.privacyNoticeAccepted || !form.termsAccepted}
                className="future-button w-full bg-[var(--foreground)] text-white shadow-[var(--shadow-md)] hover:bg-[var(--pink-dark)] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
              >
                {loading ? "..." : t.booking.submit}
              </button>

              {error && (
                <p className="text-center text-sm font-medium text-red-600 sm:col-span-2">{error}</p>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
