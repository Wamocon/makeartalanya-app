"use client";

import { motion } from "framer-motion";
import { packages, type Locale } from "@/i18n/translations";

interface PackagesProps {
  t: {
    packages: {
      badge: string;
      headline: string;
      popular: string;
      perLesson: string;
      buyNow: string;
      lessons: string;
      validity: string;
    };
  };
  locale: Locale;
}

const containerVariants = {
  hidden: { opacity: 0.95 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0.85, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function PackagesSection({ t }: PackagesProps) {
  return (
    <section id="courses" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--pink-light)] via-white to-[var(--background)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0.9, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="section-badge mx-auto justify-center">{t.packages.badge}</div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-[1.15] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.packages.headline.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "block bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] bg-clip-text text-transparent" : "block"}>
                {line}
              </span>
            ))}
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative rounded-2xl p-5 sm:p-7 border transition-all cursor-pointer ${
                pkg.popular
                  ? "bg-[var(--foreground)] border-[var(--foreground)] text-white shadow-[var(--shadow-xl)] ring-2 ring-[var(--pink)] ring-offset-2 ring-offset-[var(--pink-light)] z-10"
                  : "bg-white border-[var(--border)] text-[var(--foreground)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--pink)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[var(--shadow-pink)]">
                  {t.packages.popular}
                </div>
              )}

              <div className={`text-4xl sm:text-5xl font-bold mb-1 ${pkg.popular ? "text-white" : "text-[var(--foreground)]"}`}>
                {pkg.lessons}
              </div>
              <div className={`text-sm mb-6 font-medium ${pkg.popular ? "text-white/60" : "text-[var(--muted)]"}`}>
                {t.packages.lessons}
              </div>

              <div className="mb-1">
                <span className="text-3xl font-bold">{pkg.pricePerLesson}€</span>
                <span className={`text-xs ml-1 ${pkg.popular ? "text-white/50" : "text-[var(--muted)]"}`}>
                  /{t.packages.perLesson}
                </span>
              </div>
              <div className={`text-xs mb-6 ${pkg.popular ? "text-white/40" : "text-[var(--muted)]"}`}>
                {t.packages.validity}
              </div>

              <motion.a
                href="#booking"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`block text-center text-sm font-semibold px-4 py-3 rounded-full transition-all ${
                  pkg.popular
                    ? "bg-white text-[var(--foreground)] hover:bg-white/90 shadow-sm"
                    : "bg-[var(--foreground)] text-white hover:opacity-90"
                }`}
              >
                {t.packages.buyNow}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
