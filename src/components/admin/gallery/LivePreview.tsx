"use client";

import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { GalleryRails, type GalleryRailsCategory } from "@/components/gallery/GalleryRails";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";
import { translations } from "@/i18n/translations";
import { GALLERY_CATEGORIES, type GalleryItem, type GalleryLocale } from "@/lib/gallery/types";
import type { GalleryAdminCopy } from "@/i18n/gallery-admin";

/**
 * The gallery exactly as the website renders it.
 *
 * This mounts the real GalleryRails, the real GalleryRail and the real Lightbox
 * against the admin's current in-memory order — not a preview-shaped
 * approximation of them. A mock would be the thing that drifts: the moment the
 * rails change, a parallel implementation starts lying, and a preview that lies
 * is worse than no preview because it is believed.
 *
 * Two deliberate departures from the live page, both about it being a working
 * surface rather than a performance:
 *   - hidden items are filtered out, so this answers "what will visitors see"
 *   - the rails hold still instead of drifting, so you can read the order you
 *     just set instead of chasing it
 */
export function LivePreview({
  items,
  locale,
  copy,
  onClose,
}: {
  items: GalleryItem[];
  locale: GalleryLocale;
  copy: GalleryAdminCopy;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const shown = useMemo(
    () =>
      items
        .filter((i) => i.visible)
        .sort((a, b) => a.position - b.position),
    [items],
  );

  // Same rule the public API applies: a category with nothing visible in it does
  // not get a heading and an empty rail.
  const categories: GalleryRailsCategory[] = useMemo(
    () =>
      GALLERY_CATEGORIES.filter((c) => shown.some((i) => i.category === c.slug)).map((c) => ({
        slug: c.slug,
        label: c.label,
      })),
    [shown],
  );

  const t = translations[locale] ?? translations.en;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[var(--background)]">
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-xl bg-[var(--pink-dark)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
        >
          <ArrowLeft className="size-4" />
          {copy.exitPreview}
        </button>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
            <Eye className="size-3.5 text-[var(--pink-dark)]" />
            {copy.previewTitle}
          </p>
          <p className="truncate text-[11px] text-[var(--muted)]">{copy.previewHint}</p>
        </div>
        <span className="ml-auto shrink-0 font-mono text-[11px] text-[var(--muted)]">
          {shown.length} {copy.items}
        </span>
      </div>

      {/* From here down this is the landing page's own markup. */}
      <section className="painted-section painted-section--aqua relative overflow-hidden py-16 sm:py-20">
        <PaintedBackdrop tone="aqua" flow="right" composition="ribbons" />
        <div className="relative z-[1]">
          <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-10">
            <SectionHeading label={t.gallery.badge} title={t.gallery.headline} />
          </div>

          {categories.length === 0 ? (
            <p className="mx-auto mt-16 max-w-md px-5 text-center text-sm text-[var(--muted)]">
              {copy.empty}
            </p>
          ) : (
            <GalleryRails locale={locale} items={shown} categories={categories} staticRails />
          )}
        </div>
      </section>
    </div>
  );
}
