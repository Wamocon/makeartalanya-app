"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const PLACEHOLDER_IMAGES = [
  { id: 1, src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop", alt: "Vibrant oil painting on canvas" },
  { id: 2, src: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=600&fit=crop", alt: "Artist painting colorful artwork" },
  { id: 3, src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop", alt: "Art gallery wall display" },
  { id: 4, src: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&h=600&fit=crop", alt: "Children painting in art class" },
  { id: 5, src: "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&h=600&fit=crop", alt: "Chess game in progress" },
  { id: 6, src: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop", alt: "Paint palette and brushes" },
];

interface GalleryProps {
  t: {
    gallery: { badge: string; headline: string };
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

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
          .filter((f: { name: string }) => f.name !== ".emptyFolderPlaceholder")
          .map((f: { name: string }) => `${url}/storage/v1/object/public/gallery/${f.name}`);
        setImages(urls);
      })
      .catch(() => {});
  }, []);

  const hasRealImages = images.length > 0;

  return (
    <section id="gallery" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
          {hasRealImages
            ? images.map((url, i) => (
                <motion.div
                  key={i}
                  variants={imageVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="aspect-square rounded-2xl overflow-hidden relative group shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-shadow"
                >
                  <Image
                    src={url}
                    alt={`Gallery image ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))
            : PLACEHOLDER_IMAGES.map((item) => (
                <motion.div
                  key={item.id}
                  variants={imageVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-shadow"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
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
