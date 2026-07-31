"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface AboutProps {
  t: {
    about: {
      badge: string;
      headline: string;
      description: string;
      location: string;
      skills: string[];
      followBtn: string;
    };
  };
}

/** A Supabase Storage list entry. `metadata` is absent for folder rows. */
type InstructorObject = { name: string; metadata?: { size?: number } | null };

/** Smallest plausible real photo; guards against 0-byte upload artefacts. */
const MIN_IMAGE_BYTES = 1024;

export default function AboutSection({ t }: AboutProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    fetch(`${url}/storage/v1/object/list/instructor`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      // Ask for a few, not one: the first entry may be a placeholder or a
      // zero-byte artefact, and limit:1 would then yield no photo at all.
      body: JSON.stringify({ prefix: "", limit: 10 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const file = data.find(
          (f: InstructorObject) =>
            f.name !== ".emptyFolderPlaceholder" &&
            (f.metadata?.size ?? 0) >= MIN_IMAGE_BYTES,
        );
        if (file) {
          setPhotoUrl(`${url}/storage/v1/object/public/instructor/${file.name}`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0.85, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-start"
          >
            {photoUrl ? (
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-[var(--shadow-xl)] relative ring-4 ring-white bg-gradient-to-br from-[var(--pink-light)] to-[var(--blue-light)]">
                <Image
                  src={photoUrl}
                  alt="Instructor"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 288px, 320px"
                />
              </div>
            ) : (
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-[var(--shadow-xl)] ring-4 ring-white relative bg-gradient-to-br from-[var(--pink-light)] to-[var(--blue-light)]">
                <Image
                  src="/images/hero/hero-painting.jpg"
                  alt="Make Art Studio painting"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 288px, 320px"
                />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0.85, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="section-badge">{t.about.badge}</div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-[1.15] mb-6 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t.about.headline.split("\n").map((line, i) => (
                <span key={i} className={i === 1 ? "block bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] bg-clip-text text-transparent" : "block"}>
                  {line}
                </span>
              ))}
            </h2>

            <div className="space-y-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              <p>{t.about.description}</p>
              <p>{t.about.location}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {t.about.skills.map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.05 }}
                  className="text-sm px-4 py-2 rounded-full bg-white border border-[var(--border)] text-[var(--foreground)] font-medium shadow-[var(--shadow-sm)]"
                >
                  {skill}
                </motion.span>
              ))}
            </div>

            <motion.a
              href="https://instagram.com/make_art.tr"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="mt-8 inline-flex items-center gap-2 text-sm bg-[var(--foreground)] text-white px-5 py-2.5 rounded-full font-medium shadow-[var(--shadow-md)]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              {t.about.followBtn}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
