"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

interface PortalSectionProps {
  t: {
    portal: {
      badge: string;
      headline: string;
      description: string;
      cta: string;
      features: string[];
    };
  };
}

const featureIcons = [Calendar, TrendingUp, Zap];

export default function PortalSection({ t }: PortalSectionProps) {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5E6EA]/40 via-transparent to-[#E8F0F8]/40" />
      
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#DCA8B2]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#A9C7E5]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DCA8B2]/10 text-[#B87A88] text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DCA8B2]" />
              {t.portal.badge}
            </span>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2327] mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t.portal.headline.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>

            <p className="text-lg text-[#6B5B61] mb-8 leading-relaxed max-w-md">
              {t.portal.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-3 mb-8">
              {t.portal.features.map((feature, i) => {
                const Icon = featureIcons[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-[#F0E8EB] shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-[#DCA8B2]" />
                    <span className="text-sm font-medium text-[#2D2327]">{feature}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.03, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2D2327] to-[#4A3A40] text-white font-semibold text-base shadow-[0_4px_20px_rgba(45,35,39,0.3)] hover:shadow-[0_8px_30px_rgba(45,35,39,0.4)] transition-shadow duration-300"
              >
                {t.portal.cta}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right - Visual card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/90 to-[#FEFCFD]/90 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(220,168,178,0.15)] p-8 sm:p-10">
              {/* Mock UI elements */}
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DCA8B2] to-[#B87A88] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="h-3 w-24 rounded-full bg-[#2D2327]/80" />
                    <div className="h-2 w-16 rounded-full bg-[#9B8A8F]/40 mt-1.5" />
                  </div>
                </div>

                {/* Schedule items */}
                {[
                  { color: "#DCA8B2", width: "85%", label: "Art Class" },
                  { color: "#A9C7E5", width: "70%", label: "Chess" },
                  { color: "#E8D5DA", width: "55%", label: "Workshop" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                    className="origin-left"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-[#6B5B61]">{item.label}</span>
                      <span className="text-xs text-[#9B8A8F]">{item.width}</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#F5E6EA]/60 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: item.width, backgroundColor: item.color }}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Stats row */}
                <div className="flex gap-4 pt-4 border-t border-[#F0E8EB]">
                  {[
                    { value: "12", label: "Classes" },
                    { value: "85%", label: "Progress" },
                    { value: "4.9", label: "Rating" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center flex-1">
                      <div className="text-lg font-bold text-[#2D2327]">{stat.value}</div>
                      <div className="text-[10px] text-[#9B8A8F] uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating accent */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#DCA8B2]/20 to-[#A9C7E5]/20 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
