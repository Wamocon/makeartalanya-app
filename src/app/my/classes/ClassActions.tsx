"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Clock3, Loader2 } from "lucide-react";

/**
 * Client-side actions on the classes page: cancelling a booking, and accepting
 * or leaving a waitlist spot. All three were missing entirely — bookings were
 * read-only and the waitlist had no UI at all.
 */

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<Response>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fn();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, run };
}

export function CancelBookingButton({
  enrollmentId,
  className,
  startsAt,
}: {
  enrollmentId: string;
  className: string;
  startsAt: string | null;
}) {
  const { busy, error, run } = useAction();
  const [confirming, setConfirming] = useState(false);

  // Nothing to cancel once it has started.
  if (startsAt && new Date(startsAt) <= new Date()) return null;

  async function cancel() {
    const ok = await run(() =>
      fetch("/api/enroll/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment_id: enrollmentId }),
      }),
    );
    if (ok) setConfirming(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {confirming ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={cancel}
            disabled={busy}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#E5686B] text-white hover:bg-[#d15558] disabled:opacity-50 inline-flex items-center gap-1"
          >
            {busy && <Loader2 className="w-3 h-3 animate-spin" />} Confirm
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--background)]"
          >
            Keep
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          aria-label={`Cancel ${className}`}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-[var(--muted)] border border-[var(--border)] hover:border-[#E5686B]/40 hover:text-[#E5686B] transition-colors inline-flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      )}
      {error && <span className="text-[10px] text-[#E5686B] max-w-[220px] text-right">{error}</span>}
    </div>
  );
}

export function WaitlistActions({
  waitlistId,
  status,
  expiresAt,
}: {
  waitlistId: string;
  status: string;
  expiresAt: string | null;
}) {
  const { busy, error, run } = useAction();

  const offerExpired = Boolean(expiresAt && new Date(expiresAt) < new Date());
  const canAccept = status === "offered" && !offerExpired;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        {canAccept && (
          <button
            onClick={() =>
              run(() =>
                fetch("/api/waitlist", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ waitlist_id: waitlistId }),
                }),
              )
            }
            disabled={busy}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#6BBF7A] text-white hover:bg-[#5aa968] disabled:opacity-50 inline-flex items-center gap-1"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Take the spot
          </button>
        )}
        <button
          onClick={() =>
            run(() =>
              fetch(`/api/waitlist?id=${encodeURIComponent(waitlistId)}`, { method: "DELETE" }),
            )
          }
          disabled={busy}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-[var(--muted)] border border-[var(--border)] hover:border-[#E5686B]/40 hover:text-[#E5686B] transition-colors"
        >
          Leave
        </button>
      </div>
      {offerExpired && status === "offered" && (
        <span className="text-[10px] text-[var(--muted)] inline-flex items-center gap-1">
          <Clock3 className="w-3 h-3" /> Offer expired
        </span>
      )}
      {error && <span className="text-[10px] text-[#E5686B] max-w-[220px] text-right">{error}</span>}
    </div>
  );
}
