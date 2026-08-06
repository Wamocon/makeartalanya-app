"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ExternalLink, Loader2 } from "lucide-react";
import type { GalleryItem, GalleryCategory, GalleryLocale } from "@/lib/gallery/types";
import { categoryDef } from "@/lib/gallery/types";
import type { GalleryAdminCopy } from "@/i18n/gallery-admin";
import type { AdminLocale } from "@/i18n/admin-translations";

interface Props {
  item: GalleryItem | null;
  copy: GalleryAdminCopy;
  locale: AdminLocale;
  categories: GalleryCategory[];
  onClose: () => void;
  onSave: (id: string, patch: Record<string, unknown>) => Promise<void>;
}

const LOCALES: GalleryLocale[] = ["tr", "en", "ru"];
const LOCALE_LABEL: Record<GalleryLocale, string> = { tr: "Türkçe", en: "English", ru: "Русский" };

/** Trims and drops empty strings so a cleared field removes the key rather than storing "". */
function cleanLocaleMap(map: Partial<Record<GalleryLocale, string>>) {
  const out: Partial<Record<GalleryLocale, string>> = {};
  for (const l of LOCALES) {
    const v = map[l]?.trim();
    if (v) out[l] = v;
  }
  return out;
}

export function EditDrawer({ item, copy, locale, categories, onClose, onSave }: Props) {
  const [caption, setCaption] = useState<Partial<Record<GalleryLocale, string>>>({});
  const [alt, setAlt] = useState<Partial<Record<GalleryLocale, string>>>({});
  const [category, setCategory] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);

  // Reset the form whenever a different item is opened — without this the drawer
  // keeps the previous photo's caption and happily saves it onto the new one.
  useEffect(() => {
    if (!item) return;
    setCaption(item.caption);
    setAlt(item.alt);
    setCategory(item.category);
    setGroup(item.group);
    setVisible(item.visible);
    setError(null);
  }, [item]);

  // Focus management: remember what was focused, move into the drawer, put it
  // back on close. Skipping the restore strands keyboard users at the top of the
  // document after every edit.
  useEffect(() => {
    if (!item) return;
    restoreFocusTo.current = document.activeElement;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      // Trap Tab inside the panel. A dialog you can Tab out of leaves focus on
      // the grid behind it while the overlay still swallows the clicks.
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (restoreFocusTo.current as HTMLElement | null)?.focus?.();
    };
  }, [item, onClose]);

  if (!item) return null;

  const groups = categoryDef(category)?.groups ?? [];

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(item.id, {
        caption: cleanLocaleMap(caption),
        alt: cleanLocaleMap(alt),
        category,
        group,
        visible,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label={copy.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={copy.edit}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--border)] bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white/95 px-5 py-4 backdrop-blur-sm">
          <h2 className="text-base font-bold text-[var(--foreground)]">{copy.edit}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="rounded-xl p-2 text-[var(--muted)] transition-colors hover:bg-[var(--pink-light)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--pink-light)]">
            {item.kind === "video" ? (
              <video
                src={item.src}
                poster={item.thumb}
                controls
                playsInline
                preload="none"
                className="aspect-video w-full bg-black object-contain"
              />
            ) : (
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.thumb}
                  alt=""
                  fill
                  sizes="400px"
                  className="object-contain"
                  placeholder={item.blur ? "blur" : "empty"}
                  blurDataURL={item.blur ?? undefined}
                />
              </div>
            )}
          </div>

          <a
            href={item.src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--pink-dark)] hover:underline"
          >
            <ExternalLink className="size-3.5" />
            {copy.openOriginal}
            <span className="font-mono text-[var(--muted)]">
              {item.width}×{item.height}
            </span>
          </a>

          <Field label={copy.visibility}>
            <button
              type="button"
              role="switch"
              aria-checked={visible}
              onClick={() => setVisible((v) => !v)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)] ${
                visible
                  ? "border-[var(--pink)] bg-[var(--pink-light)]/50 text-[var(--foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"
              }`}
            >
              {visible ? copy.visibleOnSite : copy.hiddenFromSite}
              <span
                aria-hidden
                className={`relative h-5 w-9 rounded-full transition-colors ${visible ? "bg-[var(--pink-dark)]" : "bg-[var(--border)]"}`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${visible ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </span>
            </button>
          </Field>

          <Field label={copy.category}>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                // Groups belong to a category, so a stale group would be rejected
                // by the API. Clearing it here makes that impossible to hit.
                setGroup(null);
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm focus:border-[var(--pink-dark)] focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label[locale as GalleryLocale] ?? c.label.en}
                </option>
              ))}
            </select>
          </Field>

          {groups.length > 0 && (
            <Field label={copy.group}>
              <select
                value={group ?? ""}
                onChange={(e) => setGroup(e.target.value || null)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm focus:border-[var(--pink-dark)] focus:outline-none"
              >
                <option value="">{copy.noGroup}</option>
                {groups.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.label[locale as GalleryLocale] ?? g.label.en}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label={copy.captions} hint={copy.captionHint}>
            <div className="space-y-2">
              {LOCALES.map((l) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[11px] font-medium text-[var(--muted)]">
                    {LOCALE_LABEL[l]}
                  </span>
                  <input
                    type="text"
                    value={caption[l] ?? ""}
                    maxLength={300}
                    onChange={(e) => setCaption((c) => ({ ...c, [l]: e.target.value }))}
                    aria-label={`${copy.captions} — ${LOCALE_LABEL[l]}`}
                    className="min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--pink-dark)] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </Field>

          <Field label={copy.altText} hint={copy.altHint}>
            <div className="space-y-2">
              {LOCALES.map((l) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[11px] font-medium text-[var(--muted)]">
                    {LOCALE_LABEL[l]}
                  </span>
                  <input
                    type="text"
                    value={alt[l] ?? ""}
                    maxLength={300}
                    onChange={(e) => setAlt((a) => ({ ...a, [l]: e.target.value }))}
                    aria-label={`${copy.altText} — ${LOCALE_LABEL[l]}`}
                    className="min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--pink-dark)] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </Field>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-[var(--border)] bg-white/95 px-5 py-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--background)]"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--pink-dark)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-105 disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? copy.saving : copy.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">{label}</p>
      {hint && <p className="text-[11px] leading-snug text-[var(--muted)]">{hint}</p>}
      {children}
    </div>
  );
}
