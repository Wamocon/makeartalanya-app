"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Destructive confirmation.
 *
 * A real dialog rather than window.confirm: the native one cannot be translated
 * (it renders in the browser's language, not the admin's chosen one), cannot say
 * which of the three languages the studio works in, and gives no room to name
 * what is about to be lost.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusTo.current = document.activeElement;
    // Focus lands on Cancel, not Confirm. A destructive dialog whose default
    // action is armed by the next Enter keypress is how people delete things
    // they meant to keep.
    cancelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Tab") {
        // Two buttons, so the trap is just bouncing between them.
        e.preventDefault();
        (document.activeElement === cancelRef.current ? confirmRef : cancelRef).current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (restoreFocusTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label={cancelLabel}
        onClick={onCancel}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl"
      >
        <div className="mb-3 grid size-10 place-items-center rounded-xl bg-red-50 text-red-600">
          <AlertTriangle className="size-5" />
        </div>
        <h2 id="confirm-title" className="text-base font-bold text-[var(--foreground)]">
          {title}
        </h2>
        <p id="confirm-body" className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
          {body}
        </p>
        <div className="mt-5 flex gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface ToastState {
  message: string;
  tone: "info" | "error";
  /** Present only for actions that can genuinely be taken back. */
  undo?: () => void;
  undoLabel?: string;
}

export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    // Errors stay until dismissed; a message someone needs to act on should not
    // time out while they are reading it.
    if (toast.tone === "error") return;
    const timer = setTimeout(onDismiss, toast.undo ? 8000 : 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--foreground)] px-4 py-3 text-sm text-white shadow-2xl"
    >
      <span className={toast.tone === "error" ? "text-red-300" : ""}>{toast.message}</span>
      {toast.undo && (
        <button
          type="button"
          onClick={() => {
            toast.undo?.();
            onDismiss();
          }}
          className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-white/25"
        >
          {toast.undoLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="rounded-lg p-1 text-white/60 transition-colors hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
