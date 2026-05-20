"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { packages, type Locale } from "@/i18n/translations";

interface BookingProps {
  t: {
    booking: {
      badge: string;
      headline: string;
      name: string;
      email: string;
      phone: string;
      language: string;
      package: string;
      message: string;
      submit: string;
      success: string;
      errorGeneric: string;
      errorNetwork: string;
    };
    packages: { lessons: string };
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
    email: "",
    phone: "",
    language: locale,
    package: "",
    message: "",
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
        email: "",
        phone: "",
        language: locale,
        package: "",
        message: "",
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
        initial={{ opacity: 0, y: 30 }}
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
              <div className="grid sm:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide">
                  {t.booking.email} *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--pink)] text-sm bg-[var(--background)]"
                  placeholder="email@example.com"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide">
                    {t.booking.package}
                  </label>
                  <select
                    value={form.package}
                    onChange={(e) => setForm({ ...form, package: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--pink)] text-sm bg-[var(--background)]"
                  >
                    <option value="">—</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.lessons} {t.packages.lessons} — {pkg.pricePerLesson}€
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide">
                  {t.booking.message}
                </label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--pink)] text-sm bg-[var(--background)] resize-none"
                />
              </div>

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
