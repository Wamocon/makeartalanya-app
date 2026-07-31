"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Brush, Droplets, PaintBucket, Pencil, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { InstagramMark } from "@/components/sections/BrandIcons";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";

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

type InstructorObject = { name: string; metadata?: { size?: number } | null };
const MIN_IMAGE_BYTES = 1024;
const SKILL_ICONS = [PaintBucket, Brush, Pencil, Sparkles, Droplets];

function withoutLeadingSymbol(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+/u, "");
}

export default function AboutSection({ t }: AboutProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    fetch(`${url}/storage/v1/object/list/instructor`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 10 }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const file = data.find(
          (item: InstructorObject) => item.name !== ".emptyFolderPlaceholder" && (item.metadata?.size ?? 0) >= MIN_IMAGE_BYTES,
        );
        if (file) setPhotoUrl(`${url}/storage/v1/object/public/instructor/${file.name}`);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="painted-section painted-section--lilac relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <PaintedBackdrop tone="lilac" flow="right" composition="burst" />
      <div className="relative z-[1] mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-24 lg:px-10">
        <motion.div
          initial={{ opacity: 0, x: -26 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative min-h-[31rem] overflow-hidden rounded-[1.7rem] bg-[var(--pink-light)] sm:min-h-[39rem]">
            <Image
              src={photoUrl ?? "/images/hero/hero-painting.jpg"}
              alt="Make Art Studio instructor and painting practice"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 52vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(23,19,30,0.78),transparent)] px-6 pb-6 pt-20 text-white">
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white/55">Make Art Studio</span>
              <span className="mt-2 block text-lg font-bold">Mahmutlar · Alanya</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-4 hidden min-w-48 rounded-2xl border border-[var(--border)] bg-[#17131e] p-5 text-white shadow-[var(--shadow-xl)] sm:block">
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/42">Creative practice</span>
            <span className="mt-4 flex items-center gap-3 text-sm font-bold"><Brush aria-hidden="true" className="size-5 text-[var(--pink)]" /> Art · Craft · Chess</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 26 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionHeading
            label={t.about.badge}
            title={t.about.headline}
            description={<><p>{t.about.description}</p><p className="mt-2">{t.about.location}</p></>}
          />

          <div className="mt-10 border-y border-[var(--border)]">
            {t.about.skills.map((skill, index) => {
              const Icon = SKILL_ICONS[index] ?? Sparkles;
              return (
                <div key={skill} className="flex items-center justify-between border-b border-[var(--border)] py-3.5 last:border-b-0">
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <Icon aria-hidden="true" className="size-4 text-[var(--pink-dark)]" strokeWidth={1.7} />
                    {withoutLeadingSymbol(skill)}
                  </span>
                  <span className="font-mono text-[0.58rem] text-[var(--muted)]/50">0{index + 1}</span>
                </div>
              );
            })}
          </div>

          <a
            href="https://instagram.com/make_art.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="future-button mt-9 border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--pink)] hover:text-[var(--pink-dark)]"
          >
            <InstagramMark className="size-4" />
            {t.about.followBtn}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
