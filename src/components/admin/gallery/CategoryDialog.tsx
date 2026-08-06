"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, Trash2, FolderPlus } from "lucide-react";
import type { GalleryCategory, GalleryLocale } from "@/lib/gallery/types";
import type { GalleryAdminCopy } from "@/i18n/gallery-admin";

const LOCALES: GalleryLocale[] = ["tr", "en", "ru"];
const LOCALE_LABEL: Record<GalleryLocale, string> = { tr: "Türkçe", en: "English", ru: "Русский" };

export type CategoryDialogMode = { kind: "create" } | { kind: "edit"; category: GalleryCategory };

interface Props {
  mode: CategoryDialogMode | null;
  copy: GalleryAdminCopy;
  /** Every category, so delete can offer somewhere to move the contents. */
  categories: GalleryCategory[];
  onClose: () => void;
  onCreate: (label: Record<GalleryLocale, string>) => Promise<void>;
  onRename: (slug: string, label: Record<GalleryLocale, string>, visible: boolean) => Promise<void>;
  onDelete: (slug: string, moveTo: string | null) => Promise<void>;
}

/**
 * Create or edit one rail.
 *
 * All three languages are required rather than optional-with-fallback, because
 * the fallback is what produces a Russian family reading an English heading on
 * an otherwise Russian page. The database enforces the same rule; asking here
 * is how it becomes a form field instead of a 500.
 */
export function CategoryDialog({
  mode,
  copy,
  categories,
  onClose,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [label, setLabel] = useState<Record<GalleryLocale, string>>({ tr: "", en: "", ru: "" });
  const [visible, setVisible] = useState(true);
  const [moveTo, setMoveTo] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);

  const editing = mode?.kind === "edit" ? mode.category : null;
  const occupied = editing?.count ?? 0;
  const others = categories.filter((c) => c.slug !== editing?.slug);
  const isOnlyCategory = editing !== null && others.length === 0;

  useEffect(() => {
    if (!mode) return;
    setLabel(editing ? { ...editing.label } : { tr: "", en: "", ru: "" });
    setVisible(editing ? editing.visible : true);
    setMoveTo(others[0]?.slug ?? "");
    setConfirmingDelete(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (!mode) return;
    restoreFocusTo.current = document.activeElement;
    firstFieldRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'button, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (restoreFocusTo.current as HTMLElement | null)?.focus?.();
    };
  }, [mode, onClose]);

  if (!mode) return null;

  const complete = LOCALES.every((l) => label[l].trim().length > 0);

  async function submit() {
    if (!complete) return;
    setBusy(true);
    setError(null);
    try {
      const trimmed = {
        tr: label.tr.trim(),
        en: label.en.trim(),
        ru: label.ru.trim(),
      };
      if (editing) await onRename(editing.slug, trimmed, visible);
      else await onCreate(trimmed);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      await onDelete(editing.slug, occupied > 0 ? moveTo : null);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
      setConfirmingDelete(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[75] grid place-items-center p-4">
      <button
        type="button"
        aria-label={copy.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2
            id="category-dialog-title"
            className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]"
          >
            <FolderPlus className="size-4 text-[var(--pink-dark)]" />
            {editing ? copy.renameCategory : copy.newCategoryTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="rounded-xl p-2 text-[var(--muted)] transition-colors hover:bg-[var(--pink-light)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-[11px] leading-snug text-[var(--muted)]">{copy.categoryNameHint}</p>

          <div className="space-y-2">
            {LOCALES.map((l, i) => (
              <div key={l} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[11px] font-medium text-[var(--muted)]">
                  {LOCALE_LABEL[l]}
                </span>
                <input
                  ref={i === 0 ? firstFieldRef : undefined}
                  type="text"
                  value={label[l]}
                  maxLength={60}
                  required
                  onChange={(e) => setLabel((c) => ({ ...c, [l]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && complete && !busy) submit();
                  }}
                  aria-label={`${copy.category} — ${LOCALE_LABEL[l]}`}
                  className="min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--pink-dark)] focus:outline-none"
                />
              </div>
            ))}
          </div>

          {editing && (
            <>
              <button
                type="button"
                role="switch"
                aria-checked={!visible}
                onClick={() => setVisible((v) => !v)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)] ${
                  visible
                    ? "border-[var(--border)] bg-white text-[var(--muted)]"
                    : "border-[var(--pink)] bg-[var(--pink-light)]/50 text-[var(--foreground)]"
                }`}
              >
                <span className="text-left">
                  {copy.categoryHidden}
                  <span className="block text-[10px] font-normal opacity-70">
                    {copy.categoryHiddenNote}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${!visible ? "bg-[var(--pink-dark)]" : "bg-[var(--border)]"}`}
                >
                  <span
                    className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${!visible ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </span>
              </button>

              <div className="border-t border-[var(--border)] pt-4">
                {!confirmingDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    disabled={isOnlyCategory}
                    title={isOnlyCategory ? copy.lastCategory : undefined}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-[var(--muted)] disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  >
                    <Trash2 className="size-3.5" />
                    {copy.deleteCategory}
                  </button>
                ) : (
                  <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-xs leading-relaxed text-red-800">
                      {occupied > 0 ? copy.deleteCategoryFull : copy.deleteCategoryEmpty}
                    </p>

                    {occupied > 0 && (
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold text-red-900">
                          {copy.moveItemsTo} ({occupied})
                        </span>
                        <select
                          value={moveTo}
                          onChange={(e) => setMoveTo(e.target.value)}
                          className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        >
                          {others.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.label.en}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(false)}
                        className="flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium"
                      >
                        {copy.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={remove}
                        disabled={busy || (occupied > 0 && !moveTo)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {busy && <Loader2 className="size-3 animate-spin" />}
                        {copy.delete}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--background)]"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !complete}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--pink-dark)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-105 disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {editing ? copy.save : copy.create}
          </button>
        </div>
      </div>
    </div>
  );
}
