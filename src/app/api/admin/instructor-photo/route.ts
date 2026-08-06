import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The single instructor portrait shown in the About section.
 *
 * Not part of gallery_items: it is one slot, not a list, and giving it a row in
 * an ordered table would mean an item that can be dragged, hidden and
 * recategorised into a gallery it does not belong to.
 *
 * AboutSection finds it by LISTING the bucket and taking the first object over a
 * size threshold, which is why replace here means "upload the new one, then
 * delete every other object". Leaving the old file behind is not untidiness —
 * whichever one the list returns first wins, so a stale file silently becomes
 * the portrait again.
 */

/** Matches AboutSection's own floor for ignoring stray placeholder files. */
const MIN_IMAGE_BYTES = 1024;

const signSchema = z.object({ contentType: z.enum(["image/webp"]) }).strict();

const commitSchema = z.object({ path: z.string().regex(/^[A-Za-z0-9._-]+$/) }).strict();

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Server not configured." }, { status: 500 });
  }

  const { data, error } = await admin.storage.from("instructor").list("", { limit: 20 });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const file = (data ?? []).find(
    (o) => o.name !== ".emptyFolderPlaceholder" && (o.metadata?.size ?? 0) >= MIN_IMAGE_BYTES,
  );

  return NextResponse.json({
    ok: true,
    url: file ? admin.storage.from("instructor").getPublicUrl(file.name).data.publicUrl : null,
    name: file?.name ?? null,
  });
}

/** Issues a signed URL for a new portrait. */
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

  const parsed = signSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const path = `${crypto.randomUUID()}.webp`;
  const { data, error } = await admin.storage.from("instructor").createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? "Could not create an upload URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    path,
    signedUrl: data.signedUrl,
    publicUrl: admin.storage.from("instructor").getPublicUrl(path).data.publicUrl,
  });
}

/** Called once the upload lands: sweeps every older object so one file remains. */
export async function PUT(req: Request) {
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

  const parsed = commitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const keep = parsed.data.path;
  const { data: objects } = await admin.storage.from("instructor").list("", { limit: 100 });

  const stale = (objects ?? [])
    .map((o) => o.name)
    .filter((name) => name !== keep && name !== ".emptyFolderPlaceholder");

  if (stale.length) {
    const { error } = await admin.storage.from("instructor").remove(stale);
    if (error) console.error("instructor: sweep failed", error.message);
  }

  return NextResponse.json({
    ok: true,
    url: admin.storage.from("instructor").getPublicUrl(keep).data.publicUrl,
    removed: stale.length,
  });
}
