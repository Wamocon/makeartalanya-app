"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { InstagramMark } from "@/components/sections/BrandIcons";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";
import { GalleryRails } from "@/components/gallery/GalleryRails";
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
 * The photos are the studio's real archive (160 images, converted at build time
 * by scripts/build-gallery.mjs). This section previously fetched filenames from
 * a Supabase bucket that held one real photo and ten upload-test artefacts, so
 * visitors only ever saw bundled placeholders.
 */
export default function GallerySection({ t, locale }: GalleryProps) {
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

        <GalleryRails locale={locale} />
      </div>
    </section>
  );
}
