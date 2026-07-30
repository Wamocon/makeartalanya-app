"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Full-bleed hero background. Shows a poster image immediately (the LCP element),
 * and — the moment a `videoSrc` is provided — fades a muted, looping video in on
 * top of it. The video pauses off-screen / on a hidden tab and is skipped under
 * reduced-motion, so it is always a bonus, never a prerequisite.
 *
 * To ship a real hero video later, drop the file in /public and pass its path as
 * `videoSrc` — nothing else needs to change.
 */
export function HeroMedia({
  poster,
  videoSrc,
  alt,
}: {
  poster: string;
  videoSrc?: string;
  alt: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || !videoSrc) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);

    const onVisibility = () => {
      if (document.hidden) v.pause();
      else v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [videoSrc]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Image src={poster} alt={alt} fill priority sizes="100vw" className="object-cover" />
      {videoSrc && (
        <video
          ref={ref}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          src={videoSrc}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setReady(true)}
        />
      )}
    </div>
  );
}
