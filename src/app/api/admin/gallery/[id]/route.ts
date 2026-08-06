import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateItemSchema } from "@/lib/gallery/schemas";
import {
  GALLERY_ROW_COLUMNS,
  isValidGroup,
  rowToItem,
  type GalleryItemRow,
} from "@/lib/gallery/types";

/** Next 16 hands route params as a promise. */
type Ctx = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

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

  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const patch = parsed.data;

  // Groups are scoped to a category, so the pair has to be validated together —
  // and the half not being changed has to come from the stored row, or moving a
  // photo to a new category would be checked against its old group.
  const { data: current, error: readErr } = await admin
    .from("gallery_items")
    .select("category,\"group\",position")
    .eq("id", id)
    .single();

  if (readErr || !current) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const nextCategory = patch.category ?? current.category;
  const nextGroup = patch.group !== undefined ? patch.group : current.group;

  if (!isValidGroup(nextCategory, nextGroup)) {
    return NextResponse.json(
      { ok: false, error: "That group does not belong to that category." },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.group !== undefined) update.group = patch.group;
  if (patch.caption !== undefined) update.caption = patch.caption;
  if (patch.alt !== undefined) update.alt = patch.alt;
  if (patch.visible !== undefined) update.visible = patch.visible;

  // A photo moved into a different category keeps its old position number, which
  // would drop it into an arbitrary slot mid-rail. Send it to the end instead —
  // the admin can then drag it where they want, from a predictable starting
  // point rather than from wherever the arithmetic happened to land.
  if (patch.category !== undefined && patch.category !== current.category) {
    const { data: top } = await admin
      .from("gallery_items")
      .select("position")
      .eq("category", patch.category)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    update.position = (top?.position ?? 0) + 1;
    update.group = patch.group !== undefined ? patch.group : null;
  }

  const { data, error } = await admin
    .from("gallery_items")
    .update(update)
    .eq("id", id)
    .select(GALLERY_ROW_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/api/gallery");
  return NextResponse.json({ ok: true, item: rowToItem(data as GalleryItemRow) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Server not configured." }, { status: 500 });
  }

  const { data: row, error: readErr } = await admin
    .from("gallery_items")
    .select("storage_bucket,storage_path,thumb_storage_path")
    .eq("id", id)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ ok: false, error: readErr.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  if (row.storage_bucket && row.storage_path) {
    // The asset and its rail tile are separate objects under one uuid stem.
    const objects = [row.storage_path, row.thumb_storage_path].filter(
      (p): p is string => typeof p === "string",
    );
    const { error: rmErr } = await admin.storage.from(row.storage_bucket).remove(objects);
    // Orphaning an object is survivable; blocking the delete the admin asked for
    // twice is not. Logged so it can be swept later.
    if (rmErr) console.error("gallery: storage cleanup failed", rmErr.message);
  }

  const { error } = await admin.from("gallery_items").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/api/gallery");
  return NextResponse.json({ ok: true });
}
