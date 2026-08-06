"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UserRound, Loader2, UploadCloud } from "lucide-react";
import { processImage, MediaError } from "@/lib/gallery/process-media";
import type { GalleryAdminCopy } from "@/i18n/gallery-admin";

const COPY: Record<string, { title: string; hint: string; replace: string; current: string; none: string }> = {
  en: {
    title: "Instructor photo",
    hint: "One portrait, shown in the About section of the website.",
    replace: "Replace photo",
    current: "Currently on the site",
    none: "No photo uploaded — the site is showing its built-in placeholder.",
  },
  tr: {
    title: "Eğitmen fotoğrafı",
    hint: "Sitedeki Hakkımızda bölümünde gösterilen tek portre.",
    replace: "Fotoğrafı değiştir",
    current: "Şu anda sitede",
    none: "Fotoğraf yüklenmemiş — site varsayılan görseli gösteriyor.",
  },
  ru: {
    title: "Фото преподавателя",
    hint: "Один портрет, показывается в разделе «О нас».",
    replace: "Заменить фото",
    current: "Сейчас на сайте",
    none: "Фото не загружено — сайт показывает изображение по умолчанию.",
  },
};

/**
 * The single instructor portrait.
 *
 * Lives on this screen because it is the other thing the studio uploads, and the
 * page it replaced had it. It is kept visually separate from the gallery grid:
 * they look alike but behave nothing alike — this one has no order, no
 * visibility toggle, and uploading replaces rather than appends.
 */
export function InstructorPhoto({ copy, locale }: { copy: GalleryAdminCopy; locale: string }) {
  const t = COPY[locale] ?? COPY.en;
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/instructor-photo")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setUrl(j.url);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const upload = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      // Same client-side ladder as the gallery: the portrait is a hero-sized
      // image, so the 1800px variant is the one that goes up.
      const processed = await processImage(file);

      const signRes = await fetch("/api/admin/instructor-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "image/webp" }),
      });
      const sign = await signRes.json();
      if (!sign.ok) throw new MediaError(sign.error ?? "Could not start the upload.");

      const put = await fetch(sign.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
        body: processed.full,
      });
      if (!put.ok) throw new MediaError(`Upload failed (${put.status}).`);

      const commitRes = await fetch("/api/admin/instructor-photo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: sign.path }),
      });
      const commit = await commitRes.json();
      if (!commit.ok) throw new MediaError(commit.error ?? "Could not finish.");

      // Cache-bust: the CDN keeps serving the previous object for a while, and
      // an admin who just replaced the photo and still sees the old one assumes
      // it failed and does it again.
      setUrl(`${commit.url}?v=${Date.now()}`);
      URL.revokeObjectURL(processed.previewUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-start gap-5">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--pink-light)]">
          {url ? (
            <Image src={url} alt="" fill sizes="96px" className="object-cover" unoptimized />
          ) : (
            <span className="grid size-full place-items-center text-[var(--muted)]">
              <UserRound className="size-8" />
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="size-5 animate-spin text-[var(--pink-dark)]" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-[var(--foreground)]">{t.title}</h2>
          <p className="mt-0.5 text-[11px] leading-snug text-[var(--muted)]">{t.hint}</p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            {!loaded ? "…" : url ? t.current : t.none}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink-dark)] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            <UploadCloud className="size-3.5" />
            {busy ? copy.uploading : t.replace}
          </button>

          {error && (
            <p role="alert" className="mt-2 text-[11px] leading-snug text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
