"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryPhoto } from "@/data/gallery";

interface LightboxProps {
  photos: GalleryPhoto[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/** Below this drag distance a swipe is treated as a tap, not a navigation. */
const SWIPE_THRESHOLD = 60;

export function Lightbox({ photos, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null;
  const photo = open ? photos[index] : null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);
  const [direction, setDirection] = useState(0);

  const go = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return;
      setDirection(delta);
      // Wrap around: from the last photo, "next" returns to the first.
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange],
  );

  // Keyboard control, and a body scroll lock so the page behind doesn't move.
  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      // Send focus back where it came from, or a keyboard user is stranded at
      // the top of the document after closing.
      (restoreFocusTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose, go]);

  // Warm the neighbours so arrow-key browsing doesn't flash a blank frame.
  useEffect(() => {
    if (index === null) return;
    for (const delta of [1, -1]) {
      const neighbour = photos[(index + delta + photos.length) % photos.length];
      if (neighbour) {
        const img = new window.Image();
        img.src = neighbour.src;
      }
    }
  }, [index, photos]);

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#140d12]/94 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${index + 1} of ${photos.length}`}
          onClick={onClose}
        >
          {/* Counter */}
          <div className="pointer-events-none absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs text-white/80 backdrop-blur-md">
            {index + 1} / {photos.length}
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="size-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Previous photo"
                className="absolute left-2 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-6"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Next photo"
                className="absolute right-2 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.div
              key={photo.src}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -40, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_THRESHOLD) go(1);
                else if (info.offset.x > SWIPE_THRESHOLD) go(-1);
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[88vh] w-full max-w-5xl cursor-grab items-center justify-center px-4 active:cursor-grabbing"
            >
              <Image
                src={photo.src}
                alt=""
                width={photo.width}
                height={photo.height}
                placeholder="blur"
                blurDataURL={photo.blur}
                priority
                className="max-h-[88vh] w-auto rounded-2xl object-contain shadow-[0_30px_120px_rgba(0,0,0,0.5)]"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
