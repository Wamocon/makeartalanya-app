"use client";

/**
 * Walkthrough player at the top of the handbook.
 *
 * `preload="none"` is deliberate: each recording is several megabytes, and most
 * visitors are on Turkish or Russian mobile data. Nothing downloads until the
 * poster is clicked, so the handbook text below stays the cheap default path.
 *
 * The recordings are VP8/WebM — the only format Playwright's bundled ffmpeg can
 * produce. That covers every current desktop browser and iOS 15.4+. The
 * `<video>` fallback text points at the written handbook for anything older,
 * which is why the text is the source of truth and the video is the summary.
 */

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Locale } from "@/i18n/translations";

const COPY: Record<
  Locale,
  { eyebrow: string; title: string; note: string; play: string; fallback: string; failed: string }
> = {
  tr: {
    eyebrow: "Videolu tanıtım",
    title: "Stüdyoyu ve kayıt formunu 1,5 dakikada izleyin",
    note: "Video sessizdir, açıklamalar ekranda yazılıdır. Formdaki bilgiler örnektir. Ayrıntılar için aşağıdaki metne bakın.",
    play: "Videoyu oynat",
    fallback: "Tarayıcınız bu videoyu oynatamıyor. Tüm bilgiler aşağıdaki metinde yer alıyor.",
    failed: "Video şu anda yüklenemedi. Aynı bilgilerin tamamı aşağıdaki metinde yer alıyor.",
  },
  en: {
    eyebrow: "Video walkthrough",
    title: "See the studio and the registration form in 90 seconds",
    note: "The video is silent — the explanations appear on screen. The form data shown is demo data. For details, read the text below.",
    play: "Play video",
    fallback: "Your browser cannot play this video. Everything it covers is written out below.",
    failed: "The video could not be loaded. Everything it covers is written out in full below.",
  },
  ru: {
    eyebrow: "Видеообзор",
    title: "Студия и форма записи за 90 секунд",
    note: "Видео без звука — пояснения появляются на экране. Данные в форме — пример. Подробности в тексте ниже.",
    play: "Смотреть видео",
    fallback: "Ваш браузер не может воспроизвести это видео. Всё его содержание изложено в тексте ниже.",
    failed: "Видео не удалось загрузить. Всё его содержание полностью изложено в тексте ниже.",
  },
};

export function HandbookVideo({ locale }: { locale: Locale }) {
  const t = COPY[locale] ?? COPY.en;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  function start() {
    setStarted(true);
    /* The video element is always mounted, so the ref is live before the state
       update lands. A rejected play() means the source never loaded — say so
       rather than leaving the viewer looking at a black rectangle. */
    videoRef.current?.play().catch(() => setFailed(true));
  }

  return (
    <section
      aria-labelledby="handbook-video-heading"
      className="mt-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[#100d16] print:hidden"
    >
      <div className="px-5 pt-5 sm:px-7 sm:pt-6">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--pink)]">{t.eyebrow}</p>
        <h2 id="handbook-video-heading" className="mt-2 text-lg font-semibold text-white sm:text-xl">
          {t.title}
        </h2>
      </div>

      <div className="relative mt-5 aspect-video w-full bg-black">
        <video
          ref={videoRef}
          className="size-full"
          controls={started}
          preload="none"
          playsInline
          poster={`/video/walkthrough-${locale}.jpg`}
          onError={() => setFailed(true)}
          /* Silent recording — say so on the element itself rather than relying
             on the viewer to work out why there is no sound. */
          muted
        >
          <source src={`/video/walkthrough-${locale}.webm`} type="video/webm" />
          {t.fallback}
        </video>

        {failed && (
          <p
            role="status"
            className="absolute inset-0 grid place-items-center bg-[#100d16]/88 px-8 text-center text-sm text-white/80"
          >
            {t.failed}
          </p>
        )}

        {!started && !failed && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 grid place-items-center bg-[#100d16]/45 transition-colors hover:bg-[#100d16]/30"
          >
            <span className="grid size-16 place-items-center rounded-full bg-white/95 shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 sm:size-20">
              <Play aria-hidden="true" className="ml-0.5 size-7 fill-[#100d16] text-[#100d16] sm:size-8" />
            </span>
            <span className="sr-only">{t.play}</span>
          </button>
        )}
      </div>

      <p className="px-5 py-4 text-xs leading-relaxed text-white/55 sm:px-7">{t.note}</p>
    </section>
  );
}
