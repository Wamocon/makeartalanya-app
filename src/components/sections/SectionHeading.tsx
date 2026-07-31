import type { ReactNode } from "react";

interface SectionHeadingProps {
  label: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  tone = "light",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";
  const titleColor = tone === "dark" ? "text-white" : "text-[var(--foreground)]";
  const bodyColor = tone === "dark" ? "text-white/68" : "text-[var(--muted)]";

  return (
    <div className={`${centered ? "mx-auto text-center" : ""} ${className}`}>
      <div
        className={`mb-5 flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.24em] ${
          centered ? "justify-center" : ""
        } ${tone === "dark" ? "text-white/56" : "text-[var(--pink-dark)]"}`}
      >
        <span className="h-px w-8 bg-current" aria-hidden="true" />
        {label}
      </div>
      <h2
        className={`font-display text-[clamp(2.35rem,5vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.045em] ${titleColor}`}
      >
        {title.split("\n").map((line, index) => (
          <span key={`${line}-${index}`} className="block">
            {line}
          </span>
        ))}
      </h2>
      {description ? (
        <div className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${centered ? "mx-auto" : ""} ${bodyColor}`}>
          {description}
        </div>
      ) : null}
    </div>
  );
}

