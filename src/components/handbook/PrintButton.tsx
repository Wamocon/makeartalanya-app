"use client";

/**
 * Both handbooks double as printed handouts — the family handbook goes in the
 * atelier folder, the internal manual gets read away from a screen. Rather than
 * maintaining a separate PDF that goes stale the moment /rules changes, the page
 * itself is the print source and this button opens the browser dialog.
 */

import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--muted)] shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--pink-dark)] hover:text-[var(--foreground)] print:hidden"
    >
      <Printer aria-hidden="true" className="size-3.5" />
      {label}
    </button>
  );
}
