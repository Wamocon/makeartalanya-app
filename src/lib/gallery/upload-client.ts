import type { CreateItemInput } from "./schemas";
import { processFile, MediaError, type ProcessedMedia } from "./process-media";

/**
 * Drives one file from "dropped" to "a row in gallery_items".
 *
 *   process → ask for signed URLs → PUT straight to Storage → record the row
 *
 * The bytes go browser → Supabase without passing through a Next route, which
 * is what keeps a 40 MB video off Vercel's ~4.5 MB function body limit and gives
 * us genuine byte-level progress instead of a spinner that means nothing.
 */

export interface UploadProgress {
  /** 0–1 across the whole file, both variants combined. */
  ratio: number;
  stage: "processing" | "uploading" | "saving" | "done";
}

interface SignedTarget {
  path: string;
  signedUrl: string;
  publicUrl: string;
}

interface SignedPair {
  bucket: string;
  main: SignedTarget;
  thumb: SignedTarget;
}

/** One call, two keys sharing a uuid stem — so delete can clean up both. */
async function requestSignedPair(
  category: string,
  contentType: string,
  signal?: AbortSignal,
): Promise<SignedPair> {
  const res = await fetch("/api/admin/gallery/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, contentType }),
    signal,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new MediaError(json.error ?? "Could not start the upload.");
  }
  return { bucket: json.bucket, main: json.main, thumb: json.thumb };
}

/**
 * PUT to the signed URL over XHR rather than fetch.
 *
 * fetch still cannot report upload progress in any shipping browser, and for a
 * 40 MB video on Turkish mobile data the difference between a progress bar and a
 * spinner is the difference between waiting and force-reloading the page.
 */
function putWithProgress(
  url: string,
  body: Blob,
  contentType: string,
  onProgress: (loaded: number, total: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", contentType);
    // Supabase rejects a signed upload that tries to clobber an existing object.
    // Our keys are freshly generated uuids, so this only ever fires on a retry
    // of the same target — where failing loudly is right.
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded, e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new MediaError(`Upload failed (${xhr.status}). ${xhr.responseText.slice(0, 200)}`));
    xhr.onerror = () => reject(new MediaError("The connection dropped during upload."));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(body);
  });
}

export async function uploadOne(
  file: File,
  category: string,
  group: string | null,
  onProgress: (p: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<{ processed: ProcessedMedia; item: CreateItemInput }> {
  onProgress({ ratio: 0, stage: "processing" });
  const processed = await processFile(file);

  // Two objects per item: the asset itself and its rail tile. Their sizes are
  // weighted so the bar tracks bytes rather than jumping to 50% on the tiny one.
  const main = processed.kind === "photo" ? processed.full : processed.file;
  const tile = processed.kind === "photo" ? processed.thumb : processed.poster;
  const mainType = processed.kind === "photo" ? "image/webp" : processed.file.type;
  const totalBytes = main.size + tile.size;

  onProgress({ ratio: 0, stage: "uploading" });

  const { bucket, main: mainTarget, thumb: tileTarget } = await requestSignedPair(
    category,
    mainType,
    signal,
  );

  let mainLoaded = 0;
  let tileLoaded = 0;
  const report = () =>
    onProgress({ ratio: Math.min(0.99, (mainLoaded + tileLoaded) / totalBytes), stage: "uploading" });

  await putWithProgress(
    mainTarget.signedUrl,
    main,
    mainType,
    (loaded) => {
      mainLoaded = loaded;
      report();
    },
    signal,
  );

  await putWithProgress(
    tileTarget.signedUrl,
    tile,
    "image/webp",
    (loaded) => {
      tileLoaded = loaded;
      report();
    },
    signal,
  );

  onProgress({ ratio: 0.99, stage: "saving" });

  const item: CreateItemInput = {
    kind: processed.kind,
    category,
    group,
    src: mainTarget.publicUrl,
    thumb: tileTarget.publicUrl,
    blur: processed.blur,
    width: processed.width,
    height: processed.height,
    caption: {},
    alt: {},
    // Both keys are recorded so deleting the item removes both objects.
    storageBucket: bucket,
    storagePath: mainTarget.path,
    thumbStoragePath: tileTarget.path,
  };

  onProgress({ ratio: 1, stage: "done" });
  return { processed, item };
}
