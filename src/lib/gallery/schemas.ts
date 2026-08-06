import { z } from "zod";
import { CATEGORY_SLUGS, isValidGroup } from "./types";

/**
 * Everything the admin gallery routes accept.
 *
 * Kept strict on purpose. These endpoints run with the service role, so the
 * schema is the only thing standing between a malformed payload and a write that
 * bypasses RLS entirely.
 */

const categorySchema = z.enum(CATEGORY_SLUGS as [string, ...string[]]);

const localeTextSchema = z
  .object({
    tr: z.string().max(300).optional(),
    en: z.string().max(300).optional(),
    ru: z.string().max(300).optional(),
  })
  .strict();

/**
 * Storage paths are generated server-side as `<category>/<uuid>.<ext>`, so the
 * only ones ever presented back to us should match that. Rejecting slashes
 * beyond the single category segment and any dot-segment keeps a caller from
 * naming an object outside the prefix they were granted.
 */
export const storagePathSchema = z
  .string()
  .min(3)
  .max(200)
  .regex(/^[a-z0-9-]+\/[A-Za-z0-9._-]+$/, "Unexpected storage path.")
  .refine((p) => !p.includes(".."), "Unexpected storage path.");

/** Mirrors the bucket's allowed_mime_types — the DB enforces it too, this just fails faster and more legibly. */
export const UPLOAD_MIME_TYPES = {
  photo: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/webm"],
} as const;

export const ALL_UPLOAD_MIME_TYPES = [...UPLOAD_MIME_TYPES.photo, ...UPLOAD_MIME_TYPES.video];

export const uploadUrlSchema = z
  .object({
    category: categorySchema,
    contentType: z.enum(ALL_UPLOAD_MIME_TYPES as [string, ...string[]]),
    /** Only used to keep the stored extension honest; never used as the filename. */
    extension: z.string().regex(/^[a-z0-9]{2,5}$/i).optional(),
  })
  .strict();

const baseItemSchema = z.object({
  kind: z.enum(["photo", "video"]),
  category: categorySchema,
  group: z.string().min(1).max(60).nullable().default(null),
  src: z.string().min(1).max(600),
  thumb: z.string().min(1).max(600),
  blur: z.string().max(4000).nullable().default(null),
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
  caption: localeTextSchema.default({}),
  alt: localeTextSchema.default({}),
  storageBucket: z.string().max(60).nullable().default(null),
  storagePath: storagePathSchema.nullable().default(null),
  thumbStoragePath: storagePathSchema.nullable().default(null),
});

export const createItemSchema = baseItemSchema
  .strict()
  .refine((v) => isValidGroup(v.category, v.group), {
    message: "That group does not belong to that category.",
    path: ["group"],
  })
  .refine((v) => (v.storageBucket === null) === (v.storagePath === null), {
    message: "storageBucket and storagePath must be set together.",
    path: ["storagePath"],
  })
  .refine((v) => v.thumbStoragePath === null || v.storagePath !== null, {
    message: "A tracked thumbnail needs a tracked main object.",
    path: ["thumbStoragePath"],
  });

export const createItemsSchema = z
  .object({ items: z.array(createItemSchema).min(1).max(50) })
  .strict();

/**
 * Edits are deliberately narrower than creates: src, thumb, dimensions and the
 * storage pointer describe a file that already exists and must not drift away
 * from it. Re-pointing a row at a different asset is an upload, not an edit.
 */
export const updateItemSchema = z
  .object({
    category: categorySchema.optional(),
    group: z.string().min(1).max(60).nullable().optional(),
    caption: localeTextSchema.optional(),
    alt: localeTextSchema.optional(),
    visible: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update." });

export const reorderSchema = z
  .object({
    category: categorySchema,
    /** Full ordered id list for the category. Positions are rewritten as 1..n. */
    ids: z.array(z.string().uuid()).min(1).max(1000),
  })
  .strict();

export const bulkSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1).max(200),
    action: z.enum(["show", "hide", "delete"]),
  })
  .strict();

export type CreateItemInput = z.infer<typeof createItemSchema>;
