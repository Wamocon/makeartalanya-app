/**
 * Turns whatever the admin dropped into web-ready assets, in the browser.
 *
 * This mirrors scripts/build-gallery.mjs — same 1800px lightbox / 720px grid /
 * 16px blur ladder — but runs on the client, for three reasons:
 *
 *  1. A phone photo is 6–10 MB. Vercel caps a serverless request body at about
 *     4.5 MB, so anything that streams the original through an API route is
 *     broken before it starts. Downscaling first turns that into ~300 KB.
 *  2. The admin sees the tile appear the instant they drop the file, because the
 *     preview is the blob we are about to upload rather than a round-trip.
 *  3. No server-side image work at all, so no sharp in the serverless bundle and
 *     no CPU-bound function to time out on a batch of forty photos.
 *
 * HEIC is the one thing this cannot do, and it is deliberately surfaced as a
 * clear message rather than a decode failure — see assertDecodable below.
 */

/** Matches scripts/build-gallery.mjs so bundled and uploaded photos are graded alike. */
const FULL_WIDTH = 1800;
const GRID_WIDTH = 720;
const BLUR_WIDTH = 16;

const FULL_QUALITY = 0.82;
const GRID_QUALITY = 0.76;
const BLUR_QUALITY = 0.4;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

/** Bucket ceiling. The processed image lands far below this; it is a backstop for video. */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export interface ProcessedPhoto {
  kind: "photo";
  /** 1800px WebP for the lightbox. */
  full: Blob;
  /** 720px WebP for the rail. */
  thumb: Blob;
  /** Inline base64 placeholder. */
  blur: string;
  width: number;
  height: number;
  /** Object URL for the local preview; revoke when the tile unmounts. */
  previewUrl: string;
}

export interface ProcessedVideo {
  kind: "video";
  /** The original file — browsers cannot transcode, so this uploads as-is. */
  file: File;
  /** Frame grabbed from the video, used as the rail tile. */
  poster: Blob;
  blur: string;
  width: number;
  height: number;
  previewUrl: string;
}

export type ProcessedMedia = ProcessedPhoto | ProcessedVideo;

export class MediaError extends Error {}

/**
 * HEIC/HEIF cannot be decoded by any browser, and sharp cannot decode it
 * server-side either — build-gallery.mjs had to shell out to a Python decoder
 * for the 90 HEIC originals in the archive. So there is no fallback to offer,
 * and the honest thing is to say so with the fix attached.
 */
function assertDecodable(file: File) {
  const heic = /\.(heic|heif)$/i.test(file.name) || /^image\/hei[cf]/i.test(file.type);
  if (heic) {
    throw new MediaError(
      "iPhone HEIC photos can't be read by web browsers. On the iPhone: Settings → Camera → Formats → “Most Compatible”, or send the photo to yourself via WhatsApp/Telegram first — both convert it to JPEG.",
    );
  }
}

function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new MediaError("This browser could not open a drawing canvas.");
  return { canvas, ctx };
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new MediaError("This browser could not encode the image as WebP.")),
      "image/webp",
      quality,
    );
  });
}

async function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new MediaError("Could not read the generated placeholder."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Decode to a bitmap with EXIF orientation applied.
 *
 * `imageOrientation: "from-image"` is the whole point: phone cameras store
 * almost every portrait shot as landscape plus a rotation flag, and a canvas
 * that ignores the flag produces a gallery of sideways children.
 * build-gallery.mjs solves the same problem with sharp's `.rotate()`.
 */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Older Safari lacks the option (and throws on it). An <img> is the fallback
    // because CSS image-orientation defaults to from-image, so the browser
    // applies EXIF for us before we ever draw it.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "sync";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new MediaError("That file isn't an image this browser can open."));
        img.src = url;
      });
      await img.decode().catch(() => {});
      return img;
    } finally {
      // The bitmap is drawn synchronously by the caller before this matters, but
      // holding the object URL past decode leaks it for the life of the page.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
  }
}

function sourceSize(source: ImageBitmap | HTMLImageElement) {
  return source instanceof HTMLImageElement
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height };
}

/** Never upscale — a 400px original blown up to 1800 is just a bigger blurry file. */
function scaleTo(width: number, height: number, target: number) {
  const w = Math.min(target, width);
  const ratio = w / width;
  return { w: Math.round(w), h: Math.max(1, Math.round(height * ratio)) };
}

async function renderVariant(
  source: ImageBitmap | HTMLImageElement | HTMLVideoElement,
  sw: number,
  sh: number,
  target: number,
  quality: number,
) {
  const { w, h } = scaleTo(sw, sh, target);
  const { canvas, ctx } = canvasOf(w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  return { blob: await toBlob(canvas, quality), width: w, height: h };
}

export async function processImage(file: File): Promise<ProcessedPhoto> {
  assertDecodable(file);

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new MediaError(`${file.type || "That file type"} isn't a supported image.`);
  }

  const source = await decode(file);
  const { width, height } = sourceSize(source);
  if (!width || !height) throw new MediaError("That image appears to be empty.");

  const full = await renderVariant(source, width, height, FULL_WIDTH, FULL_QUALITY);
  const thumb = await renderVariant(source, width, height, GRID_WIDTH, GRID_QUALITY);
  const blur = await renderVariant(source, width, height, BLUR_WIDTH, BLUR_QUALITY);

  if (source instanceof ImageBitmap) source.close();

  return {
    kind: "photo",
    full: full.blob,
    thumb: thumb.blob,
    blur: await toDataUrl(blur.blob),
    // The stored dimensions are the full variant's, because that is the asset
    // the rail measures its tile aspect ratio from.
    width: full.width,
    height: full.height,
    previewUrl: URL.createObjectURL(thumb.blob),
  };
}

/**
 * Videos upload untouched — a browser cannot transcode — so the work here is
 * getting a poster frame out of one. The rail then renders that poster as an
 * ordinary image and never downloads a video until the lightbox opens.
 */
export async function processVideo(file: File): Promise<ProcessedVideo> {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    throw new MediaError(`${file.type || "That file type"} isn't a supported video. Use MP4 or WebM.`);
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new MediaError(
      `That video is ${(file.size / 1024 / 1024).toFixed(0)} MB. The limit is ${MAX_VIDEO_BYTES / 1024 / 1024} MB — trim it or export at a lower resolution.`,
    );
  }

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  // Same-origin blob, but without this the canvas is tainted on some engines and
  // toBlob throws a security error instead of returning the frame.
  video.crossOrigin = "anonymous";

  try {
    await new Promise<void>((resolve, reject) => {
      const fail = () =>
        reject(new MediaError("This browser couldn't read that video. Try an MP4 (H.264)."));
      video.onloadedmetadata = () => resolve();
      video.onerror = fail;
      video.src = url;
      // A file the decoder silently refuses fires neither event. Without a
      // timeout the upload tile sits on a spinner for ever.
      setTimeout(fail, 15_000);
    });

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      throw new MediaError("That video has no readable picture track.");
    }

    // A hair into the clip rather than frame zero: many encodes open on black.
    const seekTo = Math.min(video.duration && isFinite(video.duration) ? video.duration / 2 : 0.1, 1);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      video.currentTime = seekTo;
      setTimeout(resolve, 5_000);
    });

    const poster = await renderVariant(video, width, height, GRID_WIDTH, GRID_QUALITY);
    const blur = await renderVariant(video, width, height, BLUR_WIDTH, BLUR_QUALITY);

    return {
      kind: "video",
      file,
      poster: poster.blob,
      blur: await toDataUrl(blur.blob),
      width,
      height,
      previewUrl: URL.createObjectURL(poster.blob),
    };
  } finally {
    video.src = "";
    URL.revokeObjectURL(url);
  }
}

export async function processFile(file: File): Promise<ProcessedMedia> {
  if (file.type.startsWith("video/")) return processVideo(file);
  return processImage(file);
}
