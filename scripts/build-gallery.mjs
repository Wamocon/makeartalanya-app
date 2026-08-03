#!/usr/bin/env node
/**
 * Turns the studio's raw photo dump into web-ready assets + a typed manifest.
 *
 *   node scripts/build-gallery.mjs
 *
 * Why this exists rather than serving public/ directly:
 *
 *  - 90 of the 160 originals are HEIC. No browser renders HEIC — Chrome,
 *    Firefox and Safari-on-Windows all refuse it. Served as-is, well over half
 *    the gallery would be broken images.
 *  - The originals total ~310 MB, straight off a phone at 3213×5712. That is a
 *    gallery nobody on mobile data would ever finish loading.
 *  - The source folders and filenames are Cyrillic with spaces and dots, which
 *    survive URL-encoding badly and differ across filesystems.
 *
 * Output: two WebP sizes per photo (grid + lightbox), a tiny inline blur
 * placeholder, and src/data/gallery.ts with dimensions baked in so the layout
 * never jumps while images load.
 *
 * Re-runnable: skips any output that is already newer than its source.
 */

import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "source-photos", "Фотографии Make Art Studio");
const CACHE = path.join(ROOT, ".gallery-cache");
const OUT = path.join(ROOT, "public", "gallery");
const MANIFEST = path.join(ROOT, "src", "data", "gallery.ts");

/**
 * sharp reads a HEIC header but cannot decode its pixels — it fails with
 * "bad seek to N", which silently cost 90 of the 160 photos on the first run.
 * scripts/decode-heic.py turns those into JPEGs under .gallery-cache first, so
 * for a HEIC source we read the decoded copy instead.
 */
function resolveReadable(srcFile) {
  if (!/\.heic$/i.test(srcFile)) return srcFile;
  const rel = path.relative(SRC, srcFile);
  const cached = path.join(CACHE, rel.replace(/\.heic$/i, ".jpg"));
  return existsSync(cached) ? cached : srcFile;
}

const GRID_WIDTH = 720;   // masonry column render size, x2 for retina
const FULL_WIDTH = 1800;  // lightbox
const BLUR_WIDTH = 16;    // inline base64 placeholder

/**
 * Explicit mapping instead of slugifying the Cyrillic folder names: the slugs
 * become public URLs and the labels are shown to visitors, so both should be
 * deliberate rather than transliterated.
 */
const CATEGORIES = [
  {
    dir: "01. Уроки рисования и творчества",
    slug: "lessons",
    label: { tr: "Yaratıcılık Dersleri", en: "Creative Lessons", ru: "Творческие занятия" },
    groups: [
      { dir: "1. Младшая группа 4-6 лет", slug: "junior",
        label: { tr: "4–6 yaş", en: "Ages 4–6", ru: "4–6 лет" } },
      { dir: "2. Средняя группа 7-9 лет", slug: "middle",
        label: { tr: "7–9 yaş", en: "Ages 7–9", ru: "7–9 лет" } },
      { dir: "3. Старшая группа подростки 10+ и взрослые", slug: "senior",
        label: { tr: "10+ ve yetişkinler", en: "Ages 10+ & adults", ru: "10+ и взрослые" } },
    ],
  },
  {
    dir: "02. Арт лагерь",
    slug: "camp",
    label: { tr: "Sanat Kampı", en: "Summer Art Camp", ru: "Летний арт-лагерь" },
    groups: [
      { dir: "01. 2026 лето", slug: "summer-2026",
        label: { tr: "2026 Yaz", en: "Summer 2026", ru: "Лето 2026" } },
    ],
  },
  {
    dir: "03. Индивидуальные занятия",
    slug: "individual",
    label: { tr: "Birebir Atölye", en: "One-to-One Studio", ru: "Индивидуально" },
    groups: [],
  },
  {
    dir: "04. Мастер-классы",
    slug: "workshops",
    label: { tr: "Usta Atölyeleri", en: "Master Classes", ru: "Мастер-классы" },
    groups: [
      { dir: "1. Мастер-классы для детей", slug: "kids",
        label: { tr: "Çocuklar için", en: "For children", ru: "Для детей" } },
      { dir: "2. Мастер-классы для взрослых", slug: "adults",
        label: { tr: "Yetişkinler için", en: "For adults", ru: "Для взрослых" } },
    ],
  },
];

const IMAGE_RE = /\.(heic|jpe?g|png)$/i;

async function listImages(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE_RE.test(e.name))
    .map((e) => e.name)
    .sort();
}

async function isFresh(srcFile, outFile) {
  if (!existsSync(outFile)) return false;
  const [s, o] = await Promise.all([stat(srcFile), stat(outFile)]);
  return o.mtimeMs >= s.mtimeMs;
}

async function convert(srcFile, outDir, baseName) {
  const readable = resolveReadable(srcFile);
  const full = path.join(outDir, `${baseName}.webp`);
  const grid = path.join(outDir, `${baseName}-sm.webp`);

  // `.rotate()` with no argument applies the EXIF orientation tag. Phone photos
  // are almost always stored landscape with a rotation flag; without this every
  // portrait shot comes out on its side.
  const base = () => sharp(readable).rotate();

  if (!(await isFresh(readable, full))) {
    await base().resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(full);
  }
  if (!(await isFresh(readable, grid))) {
    await base().resize({ width: GRID_WIDTH, withoutEnlargement: true })
      .webp({ quality: 76 }).toFile(grid);
  }

  const meta = await sharp(full).metadata();
  const blurBuf = await base()
    .resize({ width: BLUR_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    src: `/gallery/${path.relative(OUT, full).split(path.sep).join("/")}`,
    thumb: `/gallery/${path.relative(OUT, grid).split(path.sep).join("/")}`,
    width: meta.width,
    height: meta.height,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
  };
}

async function run() {
  if (!existsSync(SRC)) {
    console.error(`Source folder not found: ${SRC}`);
    process.exit(1);
  }

  const photos = [];
  let converted = 0;
  let skipped = 0;

  for (const cat of CATEGORIES) {
    const catPath = path.join(SRC, cat.dir);
    // A category may hold photos directly (individual lessons) or only in
    // per-group subfolders (lessons, camp, workshops).
    const sources = cat.groups.length
      ? cat.groups.map((g) => ({ group: g, dir: path.join(catPath, g.dir) }))
      : [{ group: null, dir: catPath }];

    for (const { group, dir } of sources) {
      const files = await listImages(dir);
      if (!files.length) continue;

      const outDir = path.join(OUT, cat.slug, group ? group.slug : "");
      await mkdir(outDir, { recursive: true });

      for (const [i, file] of files.entries()) {
        const baseName = `${group ? group.slug : cat.slug}-${String(i + 1).padStart(3, "0")}`;
        const srcFile = path.join(dir, file);
        const outFull = path.join(outDir, `${baseName}.webp`);
        const wasFresh = await isFresh(resolveReadable(srcFile), outFull);

        try {
          const img = await convert(srcFile, outDir, baseName);
          photos.push({ ...img, category: cat.slug, group: group?.slug ?? null });
          wasFresh ? skipped++ : converted++;
          if (!wasFresh) process.stdout.write(".");
        } catch (err) {
          console.warn(`\n  ! skipped ${file}: ${err.message.split("\n")[0]}`);
        }
      }
    }
  }

  const manifest = `// AUTO-GENERATED by scripts/build-gallery.mjs — do not edit by hand.
// Re-run: node scripts/build-gallery.mjs

export type GalleryLocale = "tr" | "en" | "ru";

export interface GalleryPhoto {
  /** Full-size WebP for the lightbox. */
  src: string;
  /** Smaller WebP for the masonry grid. */
  thumb: string;
  width: number;
  height: number;
  /** Inline 16px placeholder, avoids a network round-trip before first paint. */
  blur: string;
  category: string;
  group: string | null;
}

export interface GalleryGroup {
  slug: string;
  label: Record<GalleryLocale, string>;
}

export interface GalleryCategory {
  slug: string;
  label: Record<GalleryLocale, string>;
  groups: GalleryGroup[];
  count: number;
}

export const galleryCategories: GalleryCategory[] = ${JSON.stringify(
    CATEGORIES.filter((c) => photos.some((p) => p.category === c.slug)).map((c) => ({
      slug: c.slug,
      label: c.label,
      groups: c.groups
        .filter((g) => photos.some((p) => p.group === g.slug))
        .map((g) => ({ slug: g.slug, label: g.label })),
      count: photos.filter((p) => p.category === c.slug).length,
    })),
    null,
    2,
  )};

export const galleryPhotos: GalleryPhoto[] = ${JSON.stringify(photos, null, 2)};
`;

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, manifest, "utf8");

  console.log(`\n\n✓ ${photos.length} photos (${converted} converted, ${skipped} already current)`);
  console.log(`✓ manifest: ${path.relative(ROOT, MANIFEST)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
