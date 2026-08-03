"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { GalleryPhoto } from "@/data/gallery";

/**
 * One full-bleed horizontal rail of photos.
 *
 * The look comes from a fixed row height with variable tile widths derived from
 * each photo's aspect ratio — portraits stay narrow, landscapes run wide. A
 * uniform grid reads as a contact sheet; a ragged filmstrip reads as a gallery
 * wall, which is the whole point.
 *
 * The rail drifts on its own so the section is never static, and the photo list
 * is rendered twice so the drift can wrap without a visible jump: when scroll
 * passes the halfway mark we subtract half the width, which is exactly one full
 * copy, so the frame under the cursor is identical before and after.
 */

/** Baseline drift speed. Time-based, so it is identical on 60Hz and 144Hz. */
const DRIFT_PX_PER_SECOND = 22;
/**
 * Hovering slows the rail instead of stopping it. A full stop on hover sounds
 * considerate but reads as broken: the pointer commonly just rests over a
 * full-width section while someone looks at it, and the whole gallery freezes.
 * Slowing keeps it alive while still making a tile easy to click.
 */
const HOVER_SPEED = 0.18;

interface GalleryRailProps {
  photos: GalleryPhoto[];
  /** Called with the index into `photos` (already de-duplicated). */
  onOpen: (index: number) => void;
  /** Rails alternate direction so the section doesn't read as one conveyor. */
  reverse?: boolean;
}

export function GalleryRail({ photos, onOpen, reverse = false }: GalleryRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  // The drift loop reads this from inside requestAnimationFrame, so it needs a
  // ref rather than a value captured in the effect's closure. Synced in an
  // effect, not during render — writing a ref while rendering is a bug React
  // can and does punish under concurrent rendering.
  const speedRef = useRef(1);
  useEffect(() => {
    speedRef.current = dragging ? 0 : hovered ? HOVER_SPEED : 1;
  }, [hovered, dragging]);

  // Two copies back to back give us a seamless wrap point.
  const loop = photos.length > 2 ? [...photos, ...photos] : photos;

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || photos.length <= 2) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Start the reversed rail at its midpoint so it has somewhere to travel.
    if (reverse) el.scrollLeft = el.scrollWidth / 2;

    /*
      The position is accumulated in a float here and assigned, rather than
      doing `el.scrollLeft += delta`.

      That read-modify-write silently does nothing at drift speeds: Chrome's
      scrollLeft getter snaps to an integer, so writing 0.35 and reading back 0
      every frame leaves the rail permanently motionless — no error, no warning,
      just a static gallery. Keeping our own sub-pixel accumulator means the
      fractional remainder survives between frames.
    */
    let pos = el.scrollLeft;
    let last = performance.now();
    let raf = 0;

    const step = (now: number) => {
      raf = requestAnimationFrame(step);

      const dt = Math.min(now - last, 64); // clamp: a backgrounded tab would jump
      last = now;

      const speed = speedRef.current;
      if (speed === 0 || document.hidden) {
        // Someone else moved the rail (drag, wheel, keyboard) — adopt their
        // position so drift resumes from where they left it, not from ours.
        pos = el.scrollLeft;
        return;
      }

      const half = el.scrollWidth / 2;
      if (half <= 0) return;

      pos += (reverse ? -DRIFT_PX_PER_SECOND : DRIFT_PX_PER_SECOND) * speed * (dt / 1000);

      // Wrap by exactly one copy — visually identical, so the seam is invisible.
      if (pos >= half) pos -= half;
      else if (pos <= 0) pos += half;

      el.scrollLeft = pos;
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [photos.length, reverse]);

  // Drag-to-pan on desktop; touch devices already do this natively.
  const drag = useRef<{ startX: number; startScroll: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { startX: e.clientX, startScroll: el.scrollLeft };
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el || !drag.current) return;
    el.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
  }, []);

  const endDrag = useCallback(() => {
    const moved = drag.current !== null;
    drag.current = null;
    setDragging(false);
    return moved;
  }, []);

  return (
    <div
      ref={scrollerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={() => { endDrag(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setDragging(true)}
      onBlurCapture={() => setDragging(false)}
      className="gallery-rail gallery-rail-mask flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:gap-4 sm:px-6 lg:px-10"
    >
      {loop.map((photo, i) => {
        const realIndex = i % photos.length;
        const aspect = photo.width / photo.height;

        return (
          <button
            key={`${photo.src}-${i}`}
            onClick={() => {
              // A drag that ended on a tile shouldn't also open the lightbox.
              if (drag.current) return;
              onOpen(realIndex);
            }}
            aria-label={`Open photo ${realIndex + 1} of ${photos.length}`}
            tabIndex={i < photos.length ? 0 : -1}
            className="group relative h-[15rem] w-auto shrink-0 overflow-hidden rounded-[1.15rem] bg-[var(--pink-light)] outline-none transition-[transform,box-shadow] duration-500 hover:z-10 hover:shadow-[0_24px_60px_rgba(45,35,39,0.28)] focus-visible:ring-2 focus-visible:ring-[var(--pink)] focus-visible:ring-offset-2 sm:h-[19rem] lg:h-[23rem]"
            /*
              aspect-ratio, not a computed width: the row height is responsive
              (15/19/23rem), so a width derived from one fixed height would
              distort every tile at the other two breakpoints. This lets the
              browser derive width from whichever height is active.
            */
            style={{ aspectRatio: aspect, maxWidth: "min(88vw, 44rem)" }}
          >
            <Image
              src={photo.thumb}
              alt=""
              fill
              placeholder="blur"
              blurDataURL={photo.blur}
              loading="lazy"
              draggable={false}
              sizes="(max-width: 640px) 70vw, 30vw"
              className="select-none object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.07]"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover:opacity-100"
            >
              <ArrowRight className="size-4 -rotate-45" />
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
