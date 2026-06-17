"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type Locale } from "@/i18n/translations";

interface BookingProps {
  t: {
    booking: {
      badge: string;
      headline: string;
      name: string;
      phone: string;
      language: string;
      submit: string;
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
      });
    } catch {
      setError(t.booking.errorNetwork);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="booking" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--blue-light)] via-white to-[var(--background)]" />
      
      <motion.div
        initial={{ opacity: 0.9, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 relative"
      >
        <div className="text-center mb-10">
          <div className="section-badge mx-auto justify-center">{t.booking.badge}</div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-[1.15] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.booking.headline.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "block bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] bg-clip-text text-transparent" : "block"}>
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-lg)] border border-[var(--border)]">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-lg font-medium text-[var(--foreground)]">{t.booking.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide">
                  {t.booking.name} *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--pink)] text-sm bg-[var(--background)]"
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
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--pink)] text-sm bg-[var(--background)]"
                  placeholder="+90 5xx xxx xx xx"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide">
                  {t.booking.language}
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value as Locale })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--pink)] text-sm bg-[var(--background)]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Trial class option */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] cursor-pointer hover:border-[var(--pink)] transition-colors">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--foreground)] hover:opacity-90 text-white font-semibold rounded-full transition-all text-base disabled:opacity-60 shadow-[var(--shadow-lg)]"
              >
                {loading ? "..." : t.booking.submit}
              </button>

              {error && (
                <p className="text-sm text-red-600 text-center font-medium">{error}</p>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
