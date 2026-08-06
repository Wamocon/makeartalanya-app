"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { InstagramMark } from "@/components/sections/BrandIcons";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";
import { GalleryRails, type GalleryRailsCategory } from "@/components/gallery/GalleryRails";
import { bundledFallbackItems, GALLERY_CATEGORIES, type GalleryItem } from "@/lib/gallery/types";
import type { Locale } from "@/i18n/translations";

interface GalleryProps {
  t: { gallery: { badge: string; headline: string } };
  locale: Locale;
}

/**
 * Full-bleed gallery.
 *
 * The heading stays inside a readable column, but the rails deliberately break
 * out of it and run the whole viewport width — a filmstrip that stops 300px
 * short of the screen edge looks like a mistake, and those empty margins were
 * the specific complaint about the previous layout.
 *
 * Content comes from /api/gallery, seeded with the bundled archive baked into
 * the bundle at build time. That seeding is the point: the gallery sits several
 * screens below the fold, so the fetch has long resolved by the time anyone
 * scrolls to it, and if the database is unreachable the section still renders
 * the 160 photos the site ships with rather than a hole. The admin's order wins
 * as soon as it arrives.
 */
export default function GallerySection({ t, locale }: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>(bundledFallbackItems);
  const [categories, setCategories] = useState<GalleryRailsCategory[]>(GALLERY_CATEGORIES);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/gallery", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        // An empty gallery is almost certainly a misconfiguration rather than a
        // deliberate choice, and replacing 160 working photos with nothing is
        // the worst possible reading of an ambiguous response. Keep the seed.
        if (!json?.ok || !Array.isArray(json.items) || json.items.length === 0) return;
        setItems(json.items as GalleryItem[]);
        if (Array.isArray(json.categories) && json.categories.length) {
          setCategories(json.categories as GalleryRailsCategory[]);
        }
      })
      .catch(() => {
        /* Offline or aborted — the seed is already on screen. */
      });

    return () => controller.abort();
  }, []);

  return (
    <section
      id="gallery"
      className="painted-section painted-section--aqua relative overflow-hidden py-28 sm:py-36 lg:py-44"
    >
      <PaintedBackdrop tone="aqua" flow="right" composition="ribbons" />

      <div className="relative z-[1]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto grid max-w-[100rem] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10"
        >
          <SectionHeading label={t.gallery.badge} title={t.gallery.headline} />
          <a
            href="https://instagram.com/make_art.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="future-button border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--pink)] hover:text-[var(--pink-dark)]"
          >
            <InstagramMark className="size-4" />
            @make_art.tr
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </motion.div>

        <GalleryRails locale={locale} items={items} categories={categories} />
      </div>
    </section>
  );
}
