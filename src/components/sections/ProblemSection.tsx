"use client";

import { motion } from "framer-motion";

interface ProblemSectionProps {
  t: {
    problem: {
      badge: string;
      headline: string;
      items: { icon: string; text: string }[];
      stats: { value: string; label: string; icon: string }[];
    };
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function ProblemSection({ t }: ProblemSectionProps) {
  const stats = t.problem.stats;
  return (
    <section id="why" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left: text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="section-badge">{t.problem.badge}</motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-[1.15] mb-8 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t.problem.headline.split("\n").map((line, i) => (
                <span key={i} className={i === 1 ? "block bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] bg-clip-text text-transparent" : "block"}>
                  {line}
                </span>
              ))}
            </motion.h2>
            <motion.div variants={containerVariants} className="space-y-3 mt-8">
              {t.problem.items.map((item, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--pink-light)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-[var(--foreground)]">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--pink-light)] to-[var(--blue-light)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[var(--pink-dark)] to-[var(--blue-dark)] bg-clip-text text-transparent">{stat.value}</div>
                    <div className="text-sm text-[var(--muted)] font-medium">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
