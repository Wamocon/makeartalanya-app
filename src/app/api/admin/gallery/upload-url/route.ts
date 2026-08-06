import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadUrlSchema, UPLOAD_MIME_TYPES } from "@/lib/gallery/schemas";
import { categoryExists } from "@/lib/gallery/categories-server";

/**
 * Hands the browser a short-lived URL it can upload straight to Storage with.
 *
 * The file never touches this function, which is the point. The previous
 * /api/upload streamed the whole thing through the serverless runtime and
 * advertised a 10 MB limit it could not honour: Vercel caps a function request
 * body at roughly 4.5 MB, so every upload above that failed in production with
 * an error that looked nothing like "file too large". Signed direct-to-Storage
 * uploads are Supabase's documented answer for exactly this, and they also give
 * the client a real progress bar because it owns the request.
 *
 * The path is generated here, never accepted from the caller. A signed URL is a
 * capability — whoever holds it can write to that exact key — so the key has to
 * be one we chose.
 */

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Server not configured." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = uploadUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { category, contentType } = parsed.data;

  // The category becomes the storage key prefix, so an unknown one would scatter
  // objects under a folder no category ever reads back.
  if (!(await categoryExists(admin, category))) {
    return NextResponse.json({ ok: false, error: "That category no longer exists." }, { status: 400 });
  }

  const kind = (UPLOAD_MIME_TYPES.video as readonly string[]).includes(contentType)
    ? "video"
    : "photo";

  const ext = EXT_BY_MIME[contentType] ?? "bin";

  // One item is always two objects — the asset and its rail tile — so both keys
  // are issued together off a single uuid stem. Handing them out one call at a
  // time was the first shape of this route and it meant the two halves had
  // unrelated names, which is how a deleted video leaves its poster behind.
  // Category prefix keeps the bucket browsable; the uuid makes keys unguessable
  // and collision-free. Keys are never reused: overwriting an object leaves
  // stale copies on CDN edges, which reads as "my upload didn't work" right up
  // until it suddenly does.
  const stem = `${category}/${crypto.randomUUID()}`;
  const mainPath = `${stem}.${ext}`;
  const thumbPath = `${stem}-thumb.webp`;

  const bucket = admin.storage.from("gallery");

  const [main, thumb] = await Promise.all([
    bucket.createSignedUploadUrl(mainPath),
    bucket.createSignedUploadUrl(thumbPath),
  ]);

  if (main.error || !main.data || thumb.error || !thumb.data) {
    return NextResponse.json(
      {
        ok: false,
        error: main.error?.message ?? thumb.error?.message ?? "Could not create an upload URL.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    kind,
    bucket: "gallery",
    main: {
      path: mainPath,
      signedUrl: main.data.signedUrl,
      publicUrl: bucket.getPublicUrl(mainPath).data.publicUrl,
    },
    thumb: {
      path: thumbPath,
      signedUrl: thumb.data.signedUrl,
      publicUrl: bucket.getPublicUrl(thumbPath).data.publicUrl,
    },
  });
}
