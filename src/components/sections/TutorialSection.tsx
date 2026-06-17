"use client";

import { motion } from "framer-motion";

interface TutorialSectionProps {
  t: {
    tutorial: {
      badge: string;
      headline: string;
      steps: { number: string; title: string; description: string; icon: string }[];
    };
  };
}

const containerVariants = {
  hidden: { opacity: 0.95 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0.85, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function TutorialSection({ t }: TutorialSectionProps) {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--pink-light)]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="section-badge">
            {t.tutorial.badge}
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-[1.15] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.tutorial.headline.split("\n").map((line, i) => (
              <span
                key={i}
                className={
                  i === 1
                    ? "block bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] bg-clip-text text-transparent"
                    : "block"
                }
              >
                {line}
              </span>
            ))}
          </motion.h2>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {t.tutorial.steps.map((step, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative group"
            >
              {/* Connector line (hidden on first, mobile) */}
              {i > 0 && (
                <div className="hidden lg:block absolute top-12 -left-4 lg:-left-6 w-4 lg:w-6 h-0.5 bg-gradient-to-r from-[var(--pink)] to-[var(--pink-dark)] opacity-40" />
              )}

              <div className="bg-white border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 h-full flex flex-col">
                {/* Step number + icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--pink-light)] to-[var(--pink)]/20 flex items-center justify-center">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <span className="text-4xl font-bold text-[var(--pink)]/30 group-hover:text-[var(--pink)]/60 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed flex-1">
                  {step.description}
                </p>

                {/* Bottom accent */}
                <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-[var(--pink)] to-[var(--pink-dark)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
