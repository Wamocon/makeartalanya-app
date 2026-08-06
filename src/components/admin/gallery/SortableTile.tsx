"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Eye, EyeOff, Trash2, Play, Check } from "lucide-react";
import type { GalleryItem } from "@/lib/gallery/types";
import type { GalleryAdminCopy } from "@/i18n/gallery-admin";

interface Props {
  item: GalleryItem;
  index: number;
  copy: GalleryAdminCopy;
  selected: boolean;
  onToggleSelect: (id: string, shiftKey: boolean) => void;
  onEdit: (item: GalleryItem) => void;
  onToggleVisible: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
  /** Set while this tile is the one being dragged, so the original dims. */
  dragging?: boolean;
}

/**
 * One tile in the admin grid.
 *
 * The drag handle is a dedicated grip rather than the whole tile. Making the
 * entire tile draggable is tidier to look at and much worse to use: every click
 * on edit, hide or the checkbox starts a drag first, and a tile you cannot click
 * without moving is the single most common complaint about sortable grids.
 *
 * The grip carries dnd-kit's listeners *and* its attributes, which is what makes
 * it keyboard-operable — focus it, Space to lift, arrows to move, Space to drop.
 */
export function SortableTile({
  item,
  index,
  copy,
  selected,
  onToggleSelect,
  onEdit,
  onToggleVisible,
  onDelete,
  dragging,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // The dragged tile keeps its slot but fades, so the gap it will land in stays
    // legible while the overlay follows the cursor.
    opacity: isDragging || dragging ? 0.35 : 1,
  };

  const caption = item.caption.en ?? item.caption.tr ?? item.caption.ru ?? "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border bg-white transition-shadow ${
        selected
          ? "border-[var(--pink-dark)] shadow-[0_0_0_2px_var(--pink-light)]"
          : "border-[var(--border)] hover:shadow-[var(--shadow-sm)]"
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-[var(--pink-light)]">
        <Image
          src={item.thumb}
          alt={item.alt.en ?? item.alt.tr ?? item.alt.ru ?? ""}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
          placeholder={item.blur ? "blur" : "empty"}
          blurDataURL={item.blur ?? undefined}
          className={`object-cover transition-opacity ${item.visible ? "" : "opacity-40"}`}
          draggable={false}
        />

        {/* Position badge — the number is the answer to "where does this land on
            the site", which is the whole question this screen exists to answer. */}
        <span className="absolute left-2 top-2 rounded-lg bg-black/55 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-sm">
          {index + 1}
        </span>

        {item.kind === "video" && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <Play className="size-2.5 fill-current" />
            {copy.video}
          </span>
        )}

        {!item.visible && (
          <span className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-lg bg-[var(--foreground)]/85 px-2 py-1 text-[10px] font-semibold text-white">
            <EyeOff className="size-3" />
            {copy.hidden}
          </span>
        )}

        {/* Selection checkbox. A real input so it is reachable by keyboard and
            announced as a checkbox, with the visual box drawn over it. */}
        <label
          className="absolute inset-y-0 left-0 flex w-12 cursor-pointer items-end justify-start p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) =>
              onToggleSelect(item.id, (e.nativeEvent as MouseEvent).shiftKey ?? false)
            }
            className="peer sr-only"
          />
          <span className="sr-only">
            {copy.selected} — {index + 1}
          </span>
          <span
            aria-hidden
            className={`grid size-5 place-items-center rounded-md border-2 transition-all ${
              selected
                ? "border-[var(--pink-dark)] bg-[var(--pink-dark)] text-white"
                : "border-white/80 bg-black/25 text-transparent opacity-0 backdrop-blur-sm group-hover:opacity-100 peer-focus-visible:opacity-100"
            }`}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        </label>
      </div>

      {/* Action bar. Always present rather than hover-only: a control that only
          exists on hover is invisible on touch, and this dashboard is used from
          a phone between classes. */}
      <div className="flex items-center gap-0.5 px-1.5 py-1.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`${copy.dragHint} — ${index + 1}`}
          className="cursor-grab touch-none rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--pink-light)] hover:text-[var(--pink-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)] active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          aria-label={`${copy.edit} — ${index + 1}`}
          title={copy.edit}
          className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--pink-light)] hover:text-[var(--pink-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
        >
          <Pencil className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => onToggleVisible(item)}
          aria-label={item.visible ? copy.hide : copy.show}
          title={item.visible ? copy.hide : copy.show}
          className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--pink-light)] hover:text-[var(--pink-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
        >
          {item.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>

        <button
          type="button"
          onClick={() => onDelete(item)}
          aria-label={`${copy.delete} — ${index + 1}`}
          title={copy.delete}
          className="ml-auto rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {caption && (
        <p className="truncate border-t border-[var(--border)] px-2.5 py-1.5 text-[11px] text-[var(--muted)]">
          {caption}
        </p>
      )}
    </div>
  );
}
