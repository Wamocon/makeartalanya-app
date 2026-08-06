"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GalleryRail } from "./GalleryRail";
import { Lightbox } from "./Lightbox";
import type { GalleryItem, GalleryLocale } from "@/lib/gallery/types";

/**
 * The gallery as a stack of full-bleed rails — one per category.
 *
 * Replaces the earlier uniform masonry grid. A grid of equal tiles reads as a
 * contact sheet no matter how good the photos are; giving each category its own
 * drifting filmstrip turns the category list into the structure of the section
 * rather than a filter bar bolted on top of it.
 *
 * Items arrive as props rather than being imported. That is what lets the admin
 * preview render this exact component against an unsaved order — a preview built
 * from a parallel mock is a preview of the mock, and drifts from the real thing
 * the moment either changes.
 */

const UI: Record<GalleryLocale, { photos: string; drag: string }> = {
  tr: { photos: "fotoğraf", drag: "Kaydırın" },
  en: { photos: "photos", drag: "Drag to explore" },
  ru: { photos: "фото", drag: "Листайте" },
};

export interface GalleryRailsCategory {
  slug: string;
  label: Record<GalleryLocale, string>;
}

interface Props {
  locale: GalleryLocale;
  items: GalleryItem[];
  categories: GalleryRailsCategory[];
  /** Disables the autonomous drift — the admin preview is being read, not admired. */
  staticRails?: boolean;
}

export function GalleryRails({ locale, items, categories, staticRails }: Props) {
  const t = UI[locale] ?? UI.en;

  // The lightbox needs the exact list the clicked rail was showing, so its
  // arrows walk that category rather than the whole archive.
  const [active, setActive] = useState<{ category: string; index: number } | null>(null);

  const byCategory = useMemo(() => {
    const map = new Map<string, GalleryItem[]>();
    for (const c of categories) {
      map.set(
        c.slug,
        items.filter((p) => p.category === c.slug),
      );
    }
    return map;
  }, [items, categories]);

  const activePhotos = active ? (byCategory.get(active.category) ?? []) : [];

  return (
    <div className="mt-16 space-y-16 sm:space-y-20">
      {categories.map((category, i) => {
        const photos = byCategory.get(category.slug) ?? [];
        if (photos.length === 0) return null;

        return (
          <motion.section
            key={category.slug}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            aria-label={category.label[locale]}
          >
            {/* Rail headings stay within the readable column even though the
                rail itself runs edge to edge. */}
            <div className="mx-auto mb-5 flex max-w-[100rem] items-end justify-between gap-6 px-5 sm:px-8 lg:px-10">
              <div className="flex items-baseline gap-4">
                <h3
                  className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)] sm:text-3xl lg:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {category.label[locale]}
                </h3>
                <span className="font-mono text-xs text-[var(--muted)]">
                  {photos.length} {t.photos}
                </span>
              </div>
              <span className="hidden shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--muted)] sm:block">
                {t.drag}
              </span>
            </div>

            <GalleryRail
              photos={photos}
              reverse={i % 2 === 1}
              staticRail={staticRails}
              onOpen={(index) => setActive({ category: category.slug, index })}
            />
          </motion.section>
        );
      })}

      <Lightbox
        photos={activePhotos}
        index={active?.index ?? null}
        locale={locale}
        onClose={() => setActive(null)}
        onIndexChange={(index) => setActive((a) => (a ? { ...a, index } : a))}
      />
    </div>
  );
}
