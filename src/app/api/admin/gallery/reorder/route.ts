import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { reorderSchema } from "@/lib/gallery/schemas";

/**
 * Rewrites one category's order from the full id list the grid is showing.
 *
 * Sending the whole list rather than a {id, from, to} move is what makes this
 * safe to fire on every drop: the request describes the intended end state, so
 * two drops racing each other converge on whichever arrived last instead of
 * compounding into an order nobody chose. It also means an interrupted request
 * changes nothing at all.
 *
 * Positions are rewritten 1..n in a single statement via a VALUES join — the
 * alternative, one UPDATE per row, is ~70 round-trips for the largest category
 * and can leave the order half-applied if any of them fails.
 */
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

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { category, ids } = parsed.data;

  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ ok: false, error: "Duplicate ids." }, { status: 400 });
  }

  // Every id must already belong to this category. Without the check, a payload
  // naming a photo from another rail would renumber it into this one's sequence
  // while leaving its category alone — an item ordered into a rail it is not in.
  const { data: existing, error: readErr } = await admin
    .from("gallery_items")
    .select("id")
    .eq("category", category)
    .in("id", ids);

  if (readErr) {
    return NextResponse.json({ ok: false, error: readErr.message }, { status: 500 });
  }
  if ((existing?.length ?? 0) !== ids.length) {
    return NextResponse.json(
      { ok: false, error: "Some items are no longer in this category — reload and try again." },
      { status: 409 },
    );
  }

  const { error } = await admin.rpc("fn_gallery_reorder", {
    p_category: category,
    p_ids: ids,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/api/gallery");
  return NextResponse.json({ ok: true, count: ids.length });
}
