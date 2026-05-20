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

    // Stagger animations for cards and grid items  
    const grids = document.querySelectorAll("[data-gsap-stagger]");
    grids.forEach((grid) => {
      const children = grid.children;
      gsap.fromTo(
        children,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
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
        yPercent: -30 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    // Text reveal animations
    const reveals = document.querySelectorAll("[data-gsap-reveal]");
    reveals.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30, clipPath: "inset(100% 0 0 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0 0 0)",
          duration: 0.8,
          ease: "power3.out",
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
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => {
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

    gsap.fromTo(
      el,
      { opacity: 0, y: options?.y ?? 30 },
      {
        opacity: 1,
        y: 0,
        duration: options?.duration ?? 0.8,
        delay: options?.delay ?? 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [ref, options?.delay, options?.duration, options?.y]);
}
