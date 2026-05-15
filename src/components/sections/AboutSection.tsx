"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const INSTAGRAM_PATH =
  "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z";

interface AboutProps {
  t: {
    about: { badge: string; headline: string };
  };
}

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
      body: JSON.stringify({ prefix: "", limit: 1 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const file = data.find((f: { name: string }) => f.name !== ".emptyFolderPlaceholder");
        if (file) {
          setPhotoUrl(`${url}/storage/v1/object/public/instructor/${file.name}`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center lg:justify-start">
            {photoUrl ? (
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-lg relative">
                <Image
                  src={photoUrl}
                  alt="Instructor"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 256px, 288px"
                />
              </div>
            ) : (
              <div
                className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl flex items-center justify-center text-8xl shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--pink-light), var(--blue-light))" }}
              >
                👩‍🎨
              </div>
            )}
          </div>

          <div>
            <div className="section-badge">{t.about.badge}</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight mb-6">
              {t.about.headline.split("\n").map((line, i) => (
                <span key={i} className={i === 1 ? "block text-[var(--pink-dark)]" : "block"}>
                  {line}
                </span>
              ))}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              <p>Profesyonel sanatçı ve eğitmen · Professional artist &amp; instructor · Профессиональный художник и преподаватель</p>
              <p>Alanya, Türkiye merkezli · Based in Alanya, Turkey · Работает в Алании, Турция</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["🎨 Akrilik", "🖌️ Yağlı Boya", "✏️ Karakalem", "🎭 Pastel"].map((skill) => (
                <span
                  key={skill}
                  className="text-sm px-3 py-1.5 rounded-full bg-[var(--pink-light)] text-[var(--pink-dark)] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>

            <a
              href="https://instagram.com/make_art.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-sm text-[var(--pink-dark)] hover:underline font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d={INSTAGRAM_PATH} />
              </svg>
              @make_art.tr
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
