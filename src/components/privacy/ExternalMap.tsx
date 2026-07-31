"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "makeart_external_media_2026_07";

export function ExternalMap({
  loadLabel,
  privacyLabel,
  withdrawLabel,
}: {
  loadLabel: string;
  privacyLabel: string;
  withdrawLabel: string;
}) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(localStorage.getItem(STORAGE_KEY) === "accepted");
  }, []);

  if (!allowed) {
    return (
      <div className="flex min-h-[360px] h-full flex-col items-center justify-center bg-gradient-to-br from-[var(--blue-light)]/65 via-white to-[var(--pink-light)]/55 px-8 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-white text-[var(--blue-dark)] shadow-sm">
          <MapPin className="size-6" aria-hidden="true" />
        </span>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">{privacyLabel}</p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "accepted");
            setAllowed(true);
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          {loadLabel}
        </button>
        <Link href="/cookies" className="mt-3 text-xs text-[var(--pink-dark)] underline">Cookie Policy</Link>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[360px]">
      <iframe
        src="https://maps.google.com/maps?q=Mahmutlar+Sahil+Caddesi+Alanya+Antalya+Turkey&z=16&output=embed"
        width="100%"
        height="100%"
        className="absolute inset-0 size-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Make Art Studio Location"
      />
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem(STORAGE_KEY);
          setAllowed(false);
        }}
        className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-[var(--muted)] shadow-md backdrop-blur hover:text-[var(--foreground)]"
      >
        {withdrawLabel}
      </button>
    </div>
  );
}
