"use client";

import { useEffect, useRef, useState } from "react";

interface HeroMediaProps {
  videoSources?: string[];
}

const TRANSITION_MS = 900;

export function HeroMedia({ videoSources = [] }: HeroMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const activeSlotRef = useRef(0);
  const currentIndexRef = useRef(0);
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const preloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeSlot, setActiveSlot] = useState(0);
  const [slotSources, setSlotSources] = useState<[string, string]>(() => [
    videoSources[0] ?? "",
    videoSources[1] ?? videoSources[0] ?? "",
  ]);
  const [readySlots, setReadySlots] = useState<[boolean, boolean]>([false, false]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !firstVideoRef.current || !secondVideoRef.current || videoSources.length === 0) return;

    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotionRef.current) {
      firstVideoRef.current.pause();
      secondVideoRef.current.pause();
      return;
    }

    const syncPlayback = () => {
      const activeVideo = activeSlotRef.current === 0 ? firstVideoRef.current : secondVideoRef.current;
      const inactiveVideo = activeSlotRef.current === 0 ? secondVideoRef.current : firstVideoRef.current;
      if (!activeVideo || !inactiveVideo) return;
      inactiveVideo.pause();

      if (!document.hidden && visibleRef.current) activeVideo.play().catch(() => {});
      else activeVideo.pause();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.15 },
    );

    observer.observe(container);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      if (preloadTimerRef.current) clearTimeout(preloadTimerRef.current);
    };
  }, [videoSources]);

  function markReady(slot: number) {
    setReadySlots((current) => {
      if (current[slot]) return current;
      const next: [boolean, boolean] = [...current];
      next[slot] = true;
      return next;
    });
  }

  function playNext(endedSlot: number) {
    if (endedSlot !== activeSlotRef.current || videoSources.length < 2) return;

    const nextSlot = endedSlot === 0 ? 1 : 0;
    const nextIndex = (currentIndexRef.current + 1) % videoSources.length;
    const nextVideo = nextSlot === 0 ? firstVideoRef.current : secondVideoRef.current;
    if (!nextVideo) return;

    nextVideo.currentTime = 0;
    nextVideo.play().catch(() => {});
    activeSlotRef.current = nextSlot;
    currentIndexRef.current = nextIndex;
    setActiveSlot(nextSlot);

    preloadTimerRef.current = setTimeout(() => {
      const preloadIndex = (nextIndex + 1) % videoSources.length;
      setReadySlots((current) => {
        const next: [boolean, boolean] = [...current];
        next[endedSlot] = false;
        return next;
      });
      setSlotSources((current) => {
        const next: [string, string] = [...current];
        next[endedSlot] = videoSources[preloadIndex];
        return next;
      });
    }, TRANSITION_MS);
  }

  return (
    <div ref={containerRef} className="absolute inset-[-2px] z-0 overflow-hidden bg-[radial-gradient(circle_at_72%_35%,#382434_0%,#17131e_58%,#0e0b12_100%)]">
      {videoSources.length > 0
        ? slotSources.map((source, slot) => (
            <video
              key={slot}
              ref={slot === 0 ? firstVideoRef : secondVideoRef}
              aria-hidden="true"
              className={`absolute inset-0 size-full scale-[1.012] object-cover object-center transition-opacity duration-[900ms] ease-out [backface-visibility:hidden] ${
                activeSlot === slot && readySlots[slot] ? "opacity-100" : "opacity-0"
              }`}
              src={source}
              muted
              autoPlay={slot === 0}
              playsInline
              preload={slot === 0 ? "auto" : "metadata"}
              tabIndex={-1}
              onCanPlay={() => markReady(slot)}
              onEnded={() => playNext(slot)}
            >
              Your browser does not support background video.
            </video>
          ))
        : null}
    </div>
  );
}
