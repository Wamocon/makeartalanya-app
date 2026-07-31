"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const LOCAL_IMAGES = [
  "/images/gallery/work-1.jpg",
  "/images/gallery/work-2.jpg",
  "/images/gallery/work-3.jpg",
  "/images/gallery/work-4.jpg",
  "/images/gallery/work-5.jpg",
  "/images/gallery/work-6.jpg",
];

interface GalleryProps {
  t: {
    gallery: { badge: string; headline: string };
  };
}

const containerVariants = {
  hidden: { opacity: 0.95 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const imageVariants = {
  hidden: { opacity: 0.8, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/** A Supabase Storage list entry. `metadata` is absent for folder rows. */
type GalleryObject = { name: string; metadata?: { size?: number } | null };

/** Smallest plausible real photo. Test artefacts are 0 and 13 bytes. */
const MIN_IMAGE_BYTES = 1024;

export default function GallerySection({ t }: GalleryProps) {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    fetch(`${url}/storage/v1/object/list/gallery`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: "", limit: 24, sortBy: { column: "created_at", order: "desc" } }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const urls = data
          .filter((f: GalleryObject) => f.name !== ".emptyFolderPlaceholder")
          // Skip anything too small to be a real photo. The bucket still holds
          // 0-byte and 13-byte artefacts from upload testing, and next/image
          // renders those as broken tiles. Guarding here means a bad upload can
          // never break the landing page.
          .filter((f: GalleryObject) => (f.metadata?.size ?? 0) >= MIN_IMAGE_BYTES)
          .map((f: GalleryObject) => `${url}/storage/v1/object/public/gallery/${f.name}`);
        setImages(urls);
      })
      .catch(() => {});
  }, []);

  // Always render at least 6 tiles so the grid never looks sparse; real
  // Supabase gallery images come first, padded with local studio work.
  const display = images.length
    ? [...images, ...LOCAL_IMAGES].slice(0, Math.max(6, images.length))
    : LOCAL_IMAGES;

  return (
    <section id="gallery" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0.9, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="section-badge mx-auto justify-center">{t.gallery.badge}</div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-[1.15] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.gallery.headline.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "block bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] bg-clip-text text-transparent" : "block"}>
                {line}
              </span>
            ))}
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
        >
          {display.map((src, i) => (
            <motion.div
              key={i}
              variants={imageVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--pink-light)] to-[var(--blue-light)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-lg)]"
            >
              <Image
                src={src}
                alt={`Make Art Studio gallery ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0.85 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-[var(--muted)] mt-10"
        >
          <a
            href="https://instagram.com/make_art.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-[var(--pink-dark)] transition-colors font-medium bg-[var(--pink-light)] px-4 py-2 rounded-full"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @make_art.tr
          </a>
        </motion.p>
      </div>
    </section>
  );
}
