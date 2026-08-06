import { galleryCategories, galleryPhotos, type GalleryLocale } from "@/data/gallery";

export type { GalleryLocale };

/** Photos and videos share one row shape so a rail can render either. */
export type GalleryKind = "photo" | "video";

/**
 * One gallery entry as the site and the admin both see it.
 *
 * `src`/`thumb` are opaque URLs on purpose. A bundled row points at
 * `/gallery/...` on the Vercel CDN and an uploaded row at Supabase Storage, and
 * nothing downstream of here is allowed to care which — that is what lets the
 * admin reorder the 160 legacy photos and this morning's upload in one grid.
 */
export interface GalleryItem {
  id: string;
  kind: GalleryKind;
  category: string;
  group: string | null;
  /** Lightbox asset for a photo; the video file itself for a video. */
  src: string;
  /** Rail tile. For a video this is the poster frame, so rails never load video. */
  thumb: string;
  blur: string | null;
  width: number;
  height: number;
  caption: Partial<Record<GalleryLocale, string>>;
  alt: Partial<Record<GalleryLocale, string>>;
  position: number;
  visible: boolean;
  /** Null for the bundled archive — there is no object to delete. */
  storageBucket: string | null;
  storagePath: string | null;
  /** The rail tile's own key. Deleted alongside storagePath. */
  thumbStoragePath: string | null;
}

export interface GalleryCategoryDef {
  slug: string;
  label: Record<GalleryLocale, string>;
  groups: { slug: string; label: Record<GalleryLocale, string> }[];
}

/** A category as stored in gallery_categories — the editable, admin-owned form. */
export interface GalleryCategory {
  slug: string;
  label: Record<GalleryLocale, string>;
  position: number;
  visible: boolean;
  /** Filled in by whoever counts; not a column. */
  count?: number;
}

export interface GalleryCategoryRow {
  slug: string;
  label: unknown;
  position: number;
  visible: boolean;
}

export const GALLERY_CATEGORY_COLUMNS = "slug,label,position,visible";

/**
 * A rail heading must exist in all three languages — the table enforces it — but
 * a row written before that constraint, or by hand, should degrade to something
 * readable rather than rendering "undefined" on the landing page.
 */
export function rowToCategory(row: GalleryCategoryRow): GalleryCategory {
  const raw = (row.label ?? {}) as Record<string, unknown>;
  const pick = (l: GalleryLocale) => (typeof raw[l] === "string" ? (raw[l] as string) : "");
  const en = pick("en") || row.slug;
  return {
    slug: row.slug,
    label: { tr: pick("tr") || en, en, ru: pick("ru") || en },
    position: row.position,
    visible: row.visible,
  };
}

/**
 * Turns a label into a URL-safe slug.
 *
 * Transliterates the Turkish and Cyrillic the studio actually types, because
 * stripping non-ASCII instead would turn "Мастер-классы" into "" and
 * "Sanat Kampı" into "sanat-kamp". Both are silent data loss in a value that
 * becomes a permanent public identifier.
 */
const TRANSLITERATE: Record<string, string> = {
  ı: "i", İ: "i", ş: "s", Ş: "s", ğ: "g", Ğ: "g", ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c",
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLITERATE[ch] ?? ch)
    .join("")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining marks left by NFD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/**
 * Category and group slugs stay code-defined rather than becoming rows.
 *
 * They are public URL fragments and their labels are translated three ways, so
 * they belong with the i18n. An admin who could rename a slug from a text input
 * could silently break every link that points at it; an admin who can move a
 * photo between categories — which they can, below — gets the outcome they
 * actually wanted.
 */
export const GALLERY_CATEGORIES: GalleryCategoryDef[] = galleryCategories.map((c) => ({
  slug: c.slug,
  label: c.label,
  groups: c.groups,
}));

export const CATEGORY_SLUGS = GALLERY_CATEGORIES.map((c) => c.slug);

export function categoryDef(slug: string): GalleryCategoryDef | undefined {
  return GALLERY_CATEGORIES.find((c) => c.slug === slug);
}

/** Groups belong to a category; moving an item must not strand it in a group its new category has never heard of. */
export function isValidGroup(category: string, group: string | null): boolean {
  if (group === null) return true;
  return categoryDef(category)?.groups.some((g) => g.slug === group) ?? false;
}

/** Row shape as it comes back from postgrest — snake_case, jsonb as unknown. */
export interface GalleryItemRow {
  id: string;
  kind: string;
  category: string;
  group: string | null;
  src: string;
  thumb: string;
  blur: string | null;
  width: number;
  height: number;
  caption: unknown;
  alt: unknown;
  position: number;
  visible: boolean;
  storage_bucket: string | null;
  storage_path: string | null;
  thumb_storage_path: string | null;
}

const LOCALES: GalleryLocale[] = ["tr", "en", "ru"];

/** jsonb arrives as `unknown`; keep only the three locale keys with string values. */
function localeMap(value: unknown): Partial<Record<GalleryLocale, string>> {
  if (!value || typeof value !== "object") return {};
  const src = value as Record<string, unknown>;
  const out: Partial<Record<GalleryLocale, string>> = {};
  for (const l of LOCALES) {
    const v = src[l];
    if (typeof v === "string" && v.trim()) out[l] = v;
  }
  return out;
}

export function rowToItem(row: GalleryItemRow): GalleryItem {
  return {
    id: row.id,
    kind: row.kind === "video" ? "video" : "photo",
    category: row.category,
    group: row.group,
    src: row.src,
    thumb: row.thumb,
    blur: row.blur,
    width: row.width,
    height: row.height,
    caption: localeMap(row.caption),
    alt: localeMap(row.alt),
    position: row.position,
    visible: row.visible,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    thumbStoragePath: row.thumb_storage_path,
  };
}

export const GALLERY_ROW_COLUMNS =
  'id,kind,category,"group",src,thumb,blur,width,height,caption,alt,position,visible,storage_bucket,storage_path,thumb_storage_path';

/**
 * The bundled manifest rendered as items, used as the seed the public gallery
 * paints before the database answers.
 *
 * Ids are the source path rather than a uuid: these objects never round-trip to
 * an update, they only need to be stable React keys, and the real rows carry the
 * real ids. Deriving one avoids shipping a second uuid per photo to every
 * visitor for no gain.
 */
export function bundledFallbackItems(): GalleryItem[] {
  const perCategory = new Map<string, number>();
  return galleryPhotos.map((p) => {
    const position = (perCategory.get(p.category) ?? 0) + 1;
    perCategory.set(p.category, position);
    return {
      id: `bundled:${p.src}`,
      kind: "photo" as const,
      category: p.category,
      group: p.group,
      src: p.src,
      thumb: p.thumb,
      blur: p.blur,
      width: p.width,
      height: p.height,
      caption: {},
      alt: {},
      position,
      visible: true,
      storageBucket: null,
      storagePath: null,
      thumbStoragePath: null,
    };
  });
}
