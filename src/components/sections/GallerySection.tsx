"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { InstagramMark } from "@/components/sections/BrandIcons";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";

const LOCAL_IMAGES = [
  "/images/gallery/work-1.jpg",
  "/images/gallery/work-2.jpg",
  "/images/gallery/work-3.jpg",
  "/images/gallery/work-4.jpg",
  "/images/gallery/work-5.jpg",
  "/images/gallery/work-6.jpg",
];

const TILE_STYLES = [
  "md:col-span-5 md:row-span-2",
  "md:col-span-3",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-3",
  "md:col-span-12",
];

interface GalleryProps {
  t: { gallery: { badge: string; headline: string } };
}

type GalleryObject = { name: string; metadata?: { size?: number } | null };
const MIN_IMAGE_BYTES = 1024;

export default function GallerySection({ t }: GalleryProps) {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    fetch(`${url}/storage/v1/object/list/gallery`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 24, sortBy: { column: "created_at", order: "desc" } }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setImages(
          data
            .filter((file: GalleryObject) => file.name !== ".emptyFolderPlaceholder" && (file.metadata?.size ?? 0) >= MIN_IMAGE_BYTES)
            .map((file: GalleryObject) => `${url}/storage/v1/object/public/gallery/${file.name}`),
        );
      })
      .catch(() => {});
  }, []);

  const display = (images.length ? [...images, ...LOCAL_IMAGES] : LOCAL_IMAGES).slice(0, 6);

  return (
    <section id="gallery" className="painted-section painted-section--aqua relative overflow-hidden py-28 sm:py-36 lg:py-44">
      <PaintedBackdrop tone="aqua" flow="right" composition="ribbons" />
      <div className="relative z-[1] mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
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
        </div>

        <div className="mt-16 grid auto-rows-[13rem] grid-cols-2 gap-3 md:mt-20 md:auto-rows-[16rem] md:grid-cols-12 md:gap-4" data-gsap-scale>
          {display.map((src, index) => (
            <motion.figure
              key={`${src}-${index}`}
              whileHover={{ scale: 0.992 }}
              className={`group relative col-span-1 overflow-hidden rounded-[1.35rem] bg-[var(--pink-light)] ${TILE_STYLES[index]}`}
            >
              <Image
                src={src}
                alt={`Make Art Studio creative work ${index + 1}`}
                fill
                className="object-cover saturate-[1.2] contrast-[1.06] brightness-[1.02] transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 767px) 50vw, 42vw"
              />
              <span className="absolute bottom-3 left-3 rounded-lg border border-white/22 bg-black/20 px-2 py-1 font-mono text-[0.58rem] text-white backdrop-blur-md">0{index + 1}</span>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
