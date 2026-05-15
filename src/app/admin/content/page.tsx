"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, type Locale } from "@/i18n/translations";

type ContentOverrides = Record<string, Record<string, string>>;

const EDITABLE_SECTIONS = [
  { key: "hero", fields: ["badge", "headline", "sub", "cta", "ctaSecondary"] },
  { key: "problem", fields: ["badge", "headline"] },
  { key: "packages", fields: ["badge", "headline"] },
  { key: "gallery", fields: ["badge", "headline"] },
  { key: "booking", fields: ["badge", "headline"] },
  { key: "about", fields: ["badge", "headline"] },
  { key: "location", fields: ["badge", "headline", "address", "phone", "hours"] },
  { key: "footer", fields: ["tagline"] },
];

export default function ContentAdmin() {
  const [locale, setLocale] = useState<Locale>("tr");
  const [overrides, setOverrides] = useState<ContentOverrides>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.content) {
          setOverrides(data.content);
        } else {
          setOverrides({});
        }
      })
      .catch(() => setOverrides({}))
      .finally(() => setLoading(false));
  }, [locale]);

  function getFieldValue(section: string, field: string): string {
    if (overrides[section]?.[field]) return overrides[section][field];
    const t = translations[locale] as Record<string, Record<string, unknown>>;
    const val = t[section]?.[field];
    return typeof val === "string" ? val : "";
  }

  function setFieldValue(section: string, field: string, value: string) {
    setOverrides((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, content: overrides }),
      });
      const data = await res.json();
      if (data.ok) setSaved(true);
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Content</h1>
            <p className="text-sm text-[var(--muted)]">Update texts on the landing page</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/admin" className="text-sm text-[var(--pink-dark)] hover:underline">
              ← Bookings
            </Link>
            <Link href="/admin/media" className="text-sm text-[var(--pink-dark)] hover:underline">
              Media
            </Link>
          </div>
        </div>

        {/* Locale selector */}
        <div className="flex gap-2 mb-6">
          {(["tr", "en", "ru"] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                locale === l
                  ? "bg-[var(--pink)] text-white"
                  : "bg-[var(--pink-light)] text-[var(--pink-dark)] hover:bg-[var(--pink)]/20"
              }`}
            >
              {l === "tr" ? "🇹🇷 Türkçe" : l === "en" ? "🇬🇧 English" : "🇷🇺 Русский"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        ) : (
          <>
            <div className="space-y-6">
              {EDITABLE_SECTIONS.map(({ key, fields }) => (
                <div key={key} className="bg-white border border-[var(--border)] rounded-xl p-4 sm:p-6">
                  <h2 className="text-sm font-bold uppercase text-[var(--muted)] mb-4">
                    {key}
                  </h2>
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <div key={field}>
                        <label className="text-xs text-[var(--muted)] block mb-1">{field}</label>
                        {field === "headline" || field === "sub" ? (
                          <textarea
                            value={getFieldValue(key, field)}
                            onChange={(e) => setFieldValue(key, field, e.target.value)}
                            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[var(--pink)]"
                            rows={2}
                          />
                        ) : (
                          <input
                            type="text"
                            value={getFieldValue(key, field)}
                            onChange={(e) => setFieldValue(key, field, e.target.value)}
                            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-4 mt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 bg-[var(--pink)] hover:bg-[var(--pink-dark)] text-white rounded-full font-medium transition-colors disabled:opacity-50 shadow-lg"
              >
                {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
