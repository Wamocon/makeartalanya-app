"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useGsapScrollAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Respect reduced motion — keep content fully visible
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Stagger animations for cards and grid items
    const grids = document.querySelectorAll("[data-gsap-stagger]");
    grids.forEach((grid) => {
      const children = grid.children;
      gsap.fromTo(
        children,
        { y: 24, scale: 0.985 },
        {
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Parallax effect for decorative elements
    const parallaxElements = document.querySelectorAll("[data-gsap-parallax]");
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.getAttribute("data-gsap-parallax") || "0.5");
      gsap.to(el, {
        yPercent: -20 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    // Text reveal animations — keep content readable
    const reveals = document.querySelectorAll("[data-gsap-reveal]");
    reveals.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 16 },
        {
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Smooth scale-in for images
    const images = document.querySelectorAll("[data-gsap-scale]");
    images.forEach((el) => {
      gsap.fromTo(
        el,
        { scale: 0.985 },
        {
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Safety fallback: ensure all gsap-animated elements are visible after 3s
    // in case ScrollTrigger doesn't fire (e.g. screenshots, fast loads)
    const fallbackTimer = setTimeout(() => {
      document.querySelectorAll("[data-gsap-stagger], [data-gsap-reveal], [data-gsap-scale]").forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.opacity = "1";
        htmlEl.style.transform = "none";
        htmlEl.style.clipPath = "none";
      });
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
}

export function useGsapFadeIn(ref: React.RefObject<HTMLElement | null>, options?: {
  delay?: number;
  duration?: number;
  y?: number;
}) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      el,
      { y: options?.y ?? 20 },
      {
        y: 0,
        duration: options?.duration ?? 0.7,
        delay: options?.delay ?? 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [ref, options?.delay, options?.duration, options?.y]);
}
