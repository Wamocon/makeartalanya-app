"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Paintbrush, Palette, Wand2 } from "lucide-react";

interface HeroProps {
  t: {
    hero: {
      badge: string;
      headline: string;
      sub: string;
      cta: string;
      ctaSecondary: string;
      cards: { title: string; sub: string }[];
    };
  };
}

export default function Hero({ t }: HeroProps) {
  const lines = t.hero.headline.split("\n");
  const cardIcons = [Paintbrush, Palette, Wand2];

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-30, 30, -30], x: [-10, 10, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[5%] w-[28rem] h-[28rem] rounded-full opacity-30 blur-[100px]"
          style={{ background: "var(--pink-glow)" }}
        />
        <motion.div
          animate={{ y: [30, -30, 30], x: [10, -10, 10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[5%] left-[0%] w-[32rem] h-[32rem] rounded-full opacity-25 blur-[100px]"
          style={{ background: "var(--blue-glow)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="section-badge mx-auto lg:mx-0"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--pink)] animate-pulse" />
              {t.hero.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {lines.map((line, i) => (
                <span key={i} className={i === 1 ? "block gradient-text-pink" : "block text-[var(--foreground)]"}>
                  {line}
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-[var(--muted)] max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              {t.hero.sub}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3"
            >
              <motion.a
                href="#booking"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--foreground)] text-white font-semibold px-8 py-4 rounded-full transition-all shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] text-base"
              >
                {t.hero.cta}
                <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#courses"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass-strong border border-[var(--border)] text-[var(--foreground)] font-semibold px-8 py-4 rounded-full transition-all hover:shadow-[var(--shadow-md)] text-base"
              >
                {t.hero.ctaSecondary}
              </motion.a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-12 inline-flex flex-wrap items-center justify-center lg:justify-start gap-4 glass rounded-full px-5 py-3"
            >
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                ].map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt="Student"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[var(--foreground)]">100+ students</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs font-medium text-[var(--muted)] ml-1">5.0</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right bento illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main image card */}
              <div className="relative aspect-square max-w-lg mx-auto rounded-[2rem] overflow-hidden shadow-[var(--shadow-2xl)] border border-white/60">
                <Image
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop"
                  alt="Colorful art studio painting"
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>

              {/* Floating bento cards */}
              {t.hero.cards.map((card, i) => {
                const Icon = cardIcons[i % cardIcons.length];
                const positions = [
                  "-left-8 top-[18%]",
                  "-right-6 top-[42%]",
                  "left-[5%] -bottom-6",
                ];
                const delays = [0, 0.5, 1];
                const colors = [
                  "from-pink-100 to-rose-100 text-pink-600",
                  "from-blue-100 to-sky-100 text-blue-600",
                  "from-amber-100 to-orange-100 text-amber-600",
                ];
                return (
                  <motion.div
                    key={i}
                    animate={{ y: [-6, 8, -6] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: delays[i] }}
                    className={`absolute ${positions[i]} glass-strong rounded-2xl p-3.5 flex items-center gap-3 shadow-[var(--shadow-lg)]`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[i]} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--foreground)]">{card.title}</div>
                      <div className="text-[11px] text-[var(--muted)]">{card.sub}</div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Decorative glow */}
              <div className="absolute -z-10 -inset-10 rounded-full bg-gradient-to-br from-pink-100/40 to-blue-100/40 blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex items-start justify-center p-1.5 bg-white/30"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-[var(--pink)]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
