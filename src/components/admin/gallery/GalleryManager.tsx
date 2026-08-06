"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Announcements,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Trash2,
  MonitorPlay,
  X,
  FolderInput,
  Plus,
  Settings2,
  EyeOff as EyeOffIcon,
} from "lucide-react";
import { useAdminLocale } from "@/components/admin/AdminLocaleProvider";
import { galleryAdminCopy } from "@/i18n/gallery-admin";
import type { GalleryItem, GalleryCategory, GalleryLocale } from "@/lib/gallery/types";
import { uploadOne } from "@/lib/gallery/upload-client";
import { SortableTile } from "./SortableTile";
import { UploadZone, type UploadTask } from "./UploadZone";
import { EditDrawer } from "./EditDrawer";
import { ConfirmDialog, Toast, type ToastState } from "./GalleryDialogs";
import { LivePreview } from "./LivePreview";
import { InstructorPhoto } from "./InstructorPhoto";
import { CategoryDialog, type CategoryDialogMode } from "./CategoryDialog";

/** Three at a time: enough to hide network latency, few enough that canvas encoding stays responsive. */
const UPLOAD_CONCURRENCY = 3;

export function GalleryManager({
  initialItems,
  initialCategories,
}: {
  initialItems: GalleryItem[];
  initialCategories: GalleryCategory[];
}) {
  const { locale } = useAdminLocale();
  const copy = galleryAdminCopy[locale];
  const gLocale = locale as GalleryLocale;

  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [allCategories, setAllCategories] = useState<GalleryCategory[]>(initialCategories);
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialogMode | null>(null);
  const [category, setCategory] = useState(initialCategories[0]?.slug ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GalleryItem[] | null>(null);

  // Anchor for shift-click range selection.
  const lastClicked = useRef<string | null>(null);

  const visibleItems = useMemo(
    () => items.filter((i) => i.category === category).sort((a, b) => a.position - b.position),
    [items, category],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) map.set(i.category, (map.get(i.category) ?? 0) + 1);
    return map;
  }, [items]);

  const sensors = useSensors(
    // A few pixels of slop before a drag starts, so clicking the edit button on
    // a tile is a click and not a one-pixel drag that swallows it.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** dnd-kit reads these out to screen readers; without them a drag is silent. */
  const announcements: Announcements = useMemo(
    () => ({
      onDragStart: ({ active }) => `Picked up item ${positionOf(active.id)}.`,
      onDragOver: ({ active, over }) =>
        over ? `Item ${positionOf(active.id)} moved over position ${positionOf(over.id)}.` : "",
      onDragEnd: ({ active, over }) =>
        over
          ? `Item dropped at position ${positionOf(over.id)}.`
          : `Item ${positionOf(active.id)} returned to its place.`,
      onDragCancel: ({ active }) => `Moving item ${positionOf(active.id)} cancelled.`,
    }),
    // positionOf reads the current list, which changes as items move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleItems],
  );

  function positionOf(id: string | number) {
    return visibleItems.findIndex((i) => i.id === String(id)) + 1;
  }

  const showError = useCallback((message: string) => {
    setToast({ message, tone: "error" });
  }, []);

  // ── Reorder ──────────────────────────────────────────────────────────

  async function handleDragEnd(event: DragEndEvent) {
    setDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visibleItems.findIndex((i) => i.id === active.id);
    const newIndex = visibleItems.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(visibleItems, oldIndex, newIndex);
    const previous = items;

    // Optimistic: the tile lands where it was dropped immediately. Waiting for a
    // round-trip before moving it makes every drag feel like it failed.
    setItems((all) =>
      all.map((item) => {
        const at = reordered.findIndex((r) => r.id === item.id);
        return at >= 0 ? { ...item, position: at + 1 } : item;
      }),
    );

    try {
      const res = await fetch("/api/admin/gallery/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, ids: reordered.map((r) => r.id) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not save the order.");
      setToast({ message: copy.reordered, tone: "info" });
    } catch (e) {
      setItems(previous);
      showError(e instanceof Error ? e.message : "Could not save the order.");
    }
  }

  // ── Selection ────────────────────────────────────────────────────────

  const toggleSelect = useCallback(
    (id: string, shiftKey: boolean) => {
      setSelected((current) => {
        const next = new Set(current);
        if (shiftKey && lastClicked.current) {
          // Range select, the way every file manager behaves.
          const from = visibleItems.findIndex((i) => i.id === lastClicked.current);
          const to = visibleItems.findIndex((i) => i.id === id);
          if (from >= 0 && to >= 0) {
            for (let i = Math.min(from, to); i <= Math.max(from, to); i++) {
              next.add(visibleItems[i].id);
            }
            return next;
          }
        }
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      lastClicked.current = id;
    },
    [visibleItems],
  );

  // ── Visibility / delete / move ───────────────────────────────────────

  async function bulk(ids: string[], action: "show" | "hide" | "delete") {
    const previous = items;

    if (action === "delete") {
      setItems((all) => all.filter((i) => !ids.includes(i.id)));
    } else {
      const visible = action === "show";
      setItems((all) => all.map((i) => (ids.includes(i.id) ? { ...i, visible } : i)));
    }
    setSelected(new Set());

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error ?? "That did not work.");

      if (action === "delete") {
        setToast({ message: `${ids.length} ${copy.items} — ${copy.delete.toLowerCase()}`, tone: "info" });
      } else {
        // Hiding is reversible, so it gets a real undo. Deleting is not, which is
        // why it gets a confirmation dialog instead of a promise it can't keep.
        setToast({
          message: action === "hide" ? copy.hiddenFromSite : copy.visibleOnSite,
          tone: "info",
          undoLabel: copy.undo,
          undo: () => bulk(ids, action === "hide" ? "show" : "hide"),
        });
      }
    } catch (e) {
      setItems(previous);
      showError(e instanceof Error ? e.message : "That did not work.");
    }
  }

  async function moveSelectedTo(target: string) {
    const ids = [...selected];
    if (!ids.length) return;
    const previous = items;
    setSelected(new Set());

    try {
      // One request per item: the PATCH route recomputes the destination
      // position per row, which is what stops a batch from landing on top of
      // each other in the middle of the target rail.
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/gallery/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: target, group: null }),
          }).then(async (r) => {
            const j = await r.json().catch(() => ({}));
            if (!r.ok || !j.ok) throw new Error(j.error ?? "Could not move.");
            return j.item as GalleryItem;
          }),
        ),
      );

      setItems((all) => all.map((i) => results.find((r) => r.id === i.id) ?? i));
      setToast({ message: `${ids.length} → ${labelOf(target)}`, tone: "info" });
      setCategory(target);
    } catch (e) {
      setItems(previous);
      showError(e instanceof Error ? e.message : "Could not move.");
    }
  }

  async function saveEdit(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not save.");
    setItems((all) => all.map((i) => (i.id === id ? (json.item as GalleryItem) : i)));
    setToast({ message: copy.saved, tone: "info" });
  }

  // ── Upload ───────────────────────────────────────────────────────────

  const handleFiles = useCallback(
    async (files: File[]) => {
      const queued: UploadTask[] = files.map((f) => ({
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        ratio: 0,
        stage: "processing",
      }));
      setTasks((t) => [...t, ...queued]);

      const targetCategory = category;
      let cursor = 0;

      const worker = async () => {
        while (cursor < files.length) {
          const index = cursor++;
          const file = files[index];
          const task = queued[index];

          try {
            const { item } = await uploadOne(file, targetCategory, null, (p) => {
              setTasks((t) =>
                t.map((x) => (x.id === task.id ? { ...x, ratio: p.ratio, stage: p.stage } : x)),
              );
            });

            const res = await fetch("/api/admin/gallery", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: [item] }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not save.");

            setItems((all) => [...all, ...(json.items as GalleryItem[])]);
            setTasks((t) => t.filter((x) => x.id !== task.id));
          } catch (e) {
            setTasks((t) =>
              t.map((x) =>
                x.id === task.id
                  ? {
                      ...x,
                      stage: "error",
                      error: e instanceof Error ? e.message : "Upload failed.",
                    }
                  : x,
              ),
            );
          }
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker),
      );
    },
    [category],
  );

  function labelOf(slug: string) {
    const def = allCategories.find((c) => c.slug === slug);
    return def?.label[gLocale] ?? def?.label.en ?? slug;
  }

  // ── Categories ───────────────────────────────────────────────────────

  /** Counts live on the items, so they are recomputed rather than trusted from the server. */
  const categoriesWithCounts = useMemo(
    () => allCategories.map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 })),
    [allCategories, counts],
  );

  async function createCategory(label: Record<GalleryLocale, string>) {
    const res = await fetch("/api/admin/gallery/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not create the category.");

    const created = json.category as GalleryCategory;
    setAllCategories((c) => [...c, created]);
    // Land the admin in the category they just made — they created it to put
    // something in it, and hunting for the new tab is a pointless extra step.
    setCategory(created.slug);
    setSelected(new Set());
    setToast({ message: copy.categoryCreated, tone: "info" });
  }

  async function renameCategory(
    slug: string,
    label: Record<GalleryLocale, string>,
    visible: boolean,
  ) {
    const res = await fetch(`/api/admin/gallery/categories/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, visible }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not rename.");

    setAllCategories((c) =>
      c.map((x) => (x.slug === slug ? { ...x, ...(json.category as GalleryCategory) } : x)),
    );
    setToast({ message: copy.categoryRenamed, tone: "info" });
  }

  async function deleteCategory(slug: string, moveTo: string | null) {
    const res = await fetch(`/api/admin/gallery/categories/${slug}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moveTo }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not delete.");

    // The photos were relocated server-side rather than removed; reflect that
    // locally so the destination's count is right without a full reload.
    if (moveTo) {
      setItems((all) =>
        all.map((i) => (i.category === slug ? { ...i, category: moveTo, group: null } : i)),
      );
    }
    const remaining = allCategories.filter((c) => c.slug !== slug);
    setAllCategories(remaining);
    if (category === slug) setCategory(moveTo ?? remaining[0]?.slug ?? "");
    setSelected(new Set());
    setToast({ message: copy.categoryDeleted, tone: "info" });
  }

  const draggedItem = dragId ? visibleItems.find((i) => i.id === dragId) : null;
  const activeCategory = categoriesWithCounts.find((c) => c.slug === category) ?? null;

  if (previewing) {
    return (
      <LivePreview
        items={items}
        categories={allCategories}
        locale={gLocale}
        copy={copy}
        onClose={() => setPreviewing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{copy.title}</h1>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
        >
          <MonitorPlay className="size-4" />
          {copy.preview}
        </button>
      </header>

      {/* Category tabs. Each rail on the website is one tab here — that mapping
          is the thing the screen has to teach, so the row of tabs is the first
          control and the count sits on the tab itself. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div role="tablist" aria-label={copy.category} className="flex flex-wrap gap-1.5">
          {categoriesWithCounts.map((c) => {
            const active = c.slug === category;
            return (
              <button
                key={c.slug}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setCategory(c.slug);
                  setSelected(new Set());
                }}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)] ${
                  active
                    ? "border-[var(--pink-dark)] bg-[var(--pink-light)] text-[var(--pink-dark)]"
                    : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--pink)] hover:text-[var(--foreground)]"
                }`}
              >
                {!c.visible && (
                  <EyeOffIcon
                    className="size-3 opacity-60"
                    aria-label={copy.categoryHidden}
                  />
                )}
                {c.label[gLocale] ?? c.label.en}
                <span className="font-mono text-[10px] opacity-70">{c.count}</span>
              </button>
            );
          })}
        </div>

        {activeCategory && (
          <button
            type="button"
            onClick={() => setCategoryDialog({ kind: "edit", category: activeCategory })}
            aria-label={`${copy.categorySettings} — ${activeCategory.label[gLocale] ?? activeCategory.label.en}`}
            title={copy.categorySettings}
            className="rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--muted)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            <Settings2 className="size-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setCategoryDialog({ kind: "create" })}
          className="flex items-center gap-1.5 rounded-xl border border-dashed border-[var(--pink)] bg-white px-3 py-2 text-xs font-semibold text-[var(--pink-dark)] transition-colors hover:bg-[var(--pink-light)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
        >
          <Plus className="size-3.5" />
          {copy.newCategory}
        </button>
      </div>

      <UploadZone
        copy={copy}
        tasks={tasks}
        targetLabel={activeCategory ? (activeCategory.label[gLocale] ?? activeCategory.label.en) : "—"}
        onFiles={handleFiles}
        onDismissTask={(id) => setTasks((t) => t.filter((x) => x.id !== id))}
      />

      {/* Selection toolbar. Sticky so it stays reachable when a selection spans
          a rail of seventy tiles. */}
      {selected.size > 0 && (
        <div className="sticky top-20 z-30 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--pink)] bg-[var(--pink-light)]/85 px-4 py-2.5 backdrop-blur-sm">
          <span className="text-xs font-bold text-[var(--pink-dark)]">
            {selected.size} {copy.selected}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <ToolbarButton onClick={() => bulk([...selected], "show")} icon={Eye} label={copy.show} />
            <ToolbarButton onClick={() => bulk([...selected], "hide")} icon={EyeOff} label={copy.hide} />

            <label className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)]">
              <FolderInput className="size-3.5 text-[var(--muted)]" />
              <span className="sr-only">{copy.moveTo}</span>
              <select
                value=""
                onChange={(e) => e.target.value && moveSelectedTo(e.target.value)}
                className="bg-transparent text-xs focus:outline-none"
              >
                <option value="">{copy.moveTo}…</option>
                {allCategories.filter((c) => c.slug !== category).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label[gLocale] ?? c.label.en}
                  </option>
                ))}
              </select>
            </label>

            <ToolbarButton
              onClick={() => setPendingDelete(visibleItems.filter((i) => selected.has(i.id)))}
              icon={Trash2}
              label={copy.delete}
              danger
            />
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg p-1.5 text-[var(--pink-dark)] transition-colors hover:bg-white/60"
              aria-label={copy.clearSelection}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-[11px] leading-snug text-[var(--muted)]">
          {copy.dragHint} <span className="opacity-70">{copy.keyboardHint}</span>
        </p>
        {visibleItems.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setSelected((current) =>
                current.size === visibleItems.length
                  ? new Set()
                  : new Set(visibleItems.map((i) => i.id)),
              )
            }
            className="shrink-0 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            {selected.size === visibleItems.length ? copy.clearSelection : copy.selectAll}
          </button>
        )}
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/60 p-12 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">{copy.empty}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{copy.emptyHint}</p>
          {/* A brand-new category lands here, and the dropzone has scrolled well
              off the top by then. Point back at it rather than leaving the admin
              on a dead end. */}
          <button
            type="button"
            onClick={() =>
              document
                .querySelector<HTMLElement>('input[type="file"]')
                ?.closest("div")
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--pink-dark)] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            <Plus className="size-3.5" />
            {copy.emptyUploadCta}
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          accessibility={{ announcements }}
          onDragStart={(e: DragStartEvent) => setDragId(String(e.active.id))}
          onDragCancel={() => setDragId(null)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={visibleItems.map((i) => i.id)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleItems.map((item, index) => (
                <li key={item.id}>
                  <SortableTile
                    item={item}
                    index={index}
                    copy={copy}
                    selected={selected.has(item.id)}
                    onToggleSelect={toggleSelect}
                    onEdit={setEditing}
                    onToggleVisible={(i) => bulk([i.id], i.visible ? "hide" : "show")}
                    onDelete={(i) => setPendingDelete([i])}
                  />
                </li>
              ))}
            </ul>
          </SortableContext>

          {/* The overlay is what actually follows the cursor. Without it the
              dragged tile is clipped by the grid's own overflow. */}
          <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2,0,0,1)" }}>
            {draggedItem && (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-[var(--pink-dark)] shadow-2xl">
                <Image
                  src={draggedItem.thumb}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                  draggable={false}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <InstructorPhoto copy={copy} locale={locale} />

      <EditDrawer
        item={editing}
        copy={copy}
        locale={locale}
        categories={allCategories}
        onClose={() => setEditing(null)}
        onSave={saveEdit}
      />

      <CategoryDialog
        mode={categoryDialog}
        copy={copy}
        categories={categoriesWithCounts}
        onClose={() => setCategoryDialog(null)}
        onCreate={createCategory}
        onRename={renameCategory}
        onDelete={deleteCategory}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={copy.delete}
        body={pendingDelete && pendingDelete.length > 1 ? copy.deleteConfirmMany : copy.deleteConfirm}
        confirmLabel={copy.delete}
        cancelLabel={copy.cancel}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const ids = (pendingDelete ?? []).map((i) => i.id);
          setPendingDelete(null);
          if (ids.length) bulk(ids, "delete");
        }}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        danger
          ? "border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:outline-red-500"
          : "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--background)] focus-visible:outline-[var(--pink-dark)]"
      }`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
