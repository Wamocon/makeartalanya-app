"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, AlertCircle, X, Loader2 } from "lucide-react";
import type { GalleryAdminCopy } from "@/i18n/gallery-admin";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
} from "@/lib/gallery/process-media";

export interface UploadTask {
  id: string;
  name: string;
  ratio: number;
  stage: "processing" | "uploading" | "saving" | "done" | "error";
  error?: string;
  previewUrl?: string;
}

const ACCEPT = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",");

/**
 * Drop target plus the in-flight queue.
 *
 * The zone stays visible with the grid rather than hiding behind an "Add" modal:
 * dropping forty photos from a folder is the actual job here, and a target you
 * have to open a dialog to reach turns the one-gesture case into three.
 */
export function UploadZone({
  copy,
  tasks,
  targetLabel,
  onFiles,
  onDismissTask,
}: {
  copy: GalleryAdminCopy;
  tasks: UploadTask[];
  /** Name of the category these files will land in. */
  targetLabel: string;
  onFiles: (files: File[]) => void;
  onDismissTask: (id: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Drag events fire for every child element, so a plain boolean flickers as the
  // pointer crosses the inner text. Counting enter/leave pairs is the fix.
  const depth = useRef(0);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          depth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          depth.current -= 1;
          if (depth.current <= 0) {
            depth.current = 0;
            setDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
          dragging
            ? "border-[var(--pink-dark)] bg-[var(--pink-light)]/60"
            : "border-[var(--border)] bg-white hover:border-[var(--pink)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            // Without this, picking the same file twice in a row is a no-op
            // because the input's value never changed.
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mx-auto flex flex-col items-center gap-2 rounded-xl px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--pink-light)] text-[var(--pink-dark)]">
            <UploadCloud className="size-5" />
          </span>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {dragging ? copy.dropHere : copy.upload}
          </span>
        </button>

        {/*
          Naming the destination is the whole point of this line. The dropzone
          sits above a grid that is already filtered to one category, so it looked
          obvious in development and read as "upload to the gallery, somewhere"
          to the person actually using it.
        */}
        <p className="mt-1.5 text-xs text-[var(--muted)]">
          {copy.addingTo}{" "}
          <span className="rounded-md bg-[var(--pink-light)] px-1.5 py-0.5 font-semibold text-[var(--pink-dark)]">
            {targetLabel}
          </span>
        </p>

        <p className="mx-auto mt-2 max-w-md text-[11px] leading-snug text-[var(--muted)]">
          {copy.uploadHint}
        </p>
      </div>

      {tasks.length > 0 && (
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                task.stage === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-[var(--border)] bg-white"
              }`}
            >
              {task.stage === "error" ? (
                <AlertCircle className="size-4 shrink-0 text-red-600" />
              ) : (
                <Loader2 className="size-4 shrink-0 animate-spin text-[var(--pink-dark)]" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[var(--foreground)]">{task.name}</p>
                {task.stage === "error" ? (
                  <p className="mt-0.5 text-[11px] leading-snug text-red-700">{task.error}</p>
                ) : (
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-[var(--pink-dark)] transition-[width] duration-200"
                      style={{ width: `${Math.round(task.ratio * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                {task.stage === "processing"
                  ? copy.processing
                  : task.stage === "uploading"
                    ? `${Math.round(task.ratio * 100)}%`
                    : task.stage === "saving"
                      ? copy.savingItem
                      : task.stage === "error"
                        ? copy.uploadFailed
                        : ""}
              </span>

              <button
                type="button"
                onClick={() => onDismissTask(task.id)}
                aria-label={copy.dismiss}
                className="shrink-0 rounded-lg p-1 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
