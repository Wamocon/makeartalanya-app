import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createItemsSchema, bulkSchema } from "@/lib/gallery/schemas";
import {
  GALLERY_ROW_COLUMNS,
  rowToItem,
  type GalleryItemRow,
} from "@/lib/gallery/types";

/**
 * GET  — every item including hidden ones, for the admin grid.
 * POST — record items whose files have already been uploaded.
 * PATCH — bulk show / hide / delete for multi-select.
 */

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Server not configured." }, { status: 500 });
  }

  const { data, error } = await admin
    .from("gallery_items")
    .select(GALLERY_ROW_COLUMNS)
    .order("category", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    items: (data as GalleryItemRow[]).map(rowToItem),
  });
}

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

  const parsed = createItemsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  // New arrivals go to the end of their category. Reading the current maximum
  // per category costs one query and means an upload never silently displaces
  // whatever the admin last arranged by hand.
  const categories = [...new Set(parsed.data.items.map((i) => i.category))];
  const { data: tops, error: topErr } = await admin
    .from("gallery_items")
    .select("category,position")
    .in("category", categories)
    .order("position", { ascending: false });

  if (topErr) {
    return NextResponse.json({ ok: false, error: topErr.message }, { status: 500 });
  }

  const nextPosition = new Map<string, number>();
  for (const row of (tops ?? []) as { category: string; position: number }[]) {
    if (!nextPosition.has(row.category)) nextPosition.set(row.category, row.position + 1);
  }

  const rows = parsed.data.items.map((item) => {
    const position = nextPosition.get(item.category) ?? 1;
    nextPosition.set(item.category, position + 1);
    return {
      kind: item.kind,
      category: item.category,
      group: item.group,
      src: item.src,
      thumb: item.thumb,
      blur: item.blur,
      width: item.width,
      height: item.height,
      caption: item.caption,
      alt: item.alt,
      position,
      storage_bucket: item.storageBucket,
      storage_path: item.storagePath,
      thumb_storage_path: item.thumbStoragePath,
    };
  });

  const { data, error } = await admin
    .from("gallery_items")
    .insert(rows)
    .select(GALLERY_ROW_COLUMNS);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/api/gallery");

  return NextResponse.json({
    ok: true,
    items: (data as GalleryItemRow[]).map(rowToItem),
  });
}

export async function PATCH(req: Request) {
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

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { ids, action } = parsed.data;

  if (action !== "delete") {
    const { error } = await admin
      .from("gallery_items")
      .update({ visible: action === "show" })
      .in("id", ids);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    revalidatePath("/api/gallery");
    return NextResponse.json({ ok: true, affected: ids.length });
  }

  // Delete: remove the storage objects for the rows that own one, then the rows.
  // Bundled rows carry no storage_path — their pixels are in the repo and are
  // not ours to delete here.
  const { data: doomed, error: readErr } = await admin
    .from("gallery_items")
    .select("id,storage_bucket,storage_path,thumb_storage_path")
    .in("id", ids);

  if (readErr) {
    return NextResponse.json({ ok: false, error: readErr.message }, { status: 500 });
  }

  // An item is two objects: the asset and its rail tile. Both go.
  const paths = (doomed ?? [])
    .filter((r) => Boolean(r.storage_path && r.storage_bucket))
    .flatMap((r) => [r.storage_path, r.thumb_storage_path])
    .filter((p): p is string => typeof p === "string");

  if (paths.length) {
    // A failure here is logged, not fatal. An orphaned object costs a few
    // kilobytes; refusing the delete would leave the admin staring at a photo
    // they have asked twice to remove.
    const { error: rmErr } = await admin.storage.from("gallery").remove(paths);
    if (rmErr) console.error("gallery: storage cleanup failed", rmErr.message);
  }

  const { error } = await admin.from("gallery_items").delete().in("id", ids);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/api/gallery");
  return NextResponse.json({ ok: true, affected: ids.length });
}
