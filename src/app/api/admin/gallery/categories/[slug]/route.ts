import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateCategorySchema, deleteCategorySchema } from "@/lib/gallery/schemas";
import {
  GALLERY_CATEGORY_COLUMNS,
  rowToCategory,
  type GalleryCategoryRow,
} from "@/lib/gallery/types";

type Ctx = { params: Promise<{ slug: string }> };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Rename the label or toggle visibility. The slug itself is immutable. */
export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { slug } = await params;
  if (!SLUG.test(slug)) {
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

  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { data, error } = await admin
    .from("gallery_categories")
    .update(parsed.data)
    .eq("slug", slug)
    .select(GALLERY_CATEGORY_COLUMNS)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  revalidatePath("/api/gallery");
  return NextResponse.json({ ok: true, category: rowToCategory(data as GalleryCategoryRow) });
}

/**
 * Delete a category, optionally relocating whatever is in it.
 *
 * The foreign key is ON DELETE RESTRICT, so a non-empty category cannot be
 * removed by accident. `moveTo` is how the admin says what should happen to the
 * contents instead — the alternative, cascading, turns one click into forty
 * deleted photos with no way back.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { slug } = await params;
  if (!SLUG.test(slug)) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Server not configured." }, { status: 500 });
  }

  // A body is optional here; no body means "only delete it if it is empty".
  let moveTo: string | null = null;
  try {
    const parsed = deleteCategorySchema.safeParse(await req.json());
    if (parsed.success) moveTo = parsed.data.moveTo;
  } catch {
    /* no body */
  }

  const { count } = await admin
    .from("gallery_items")
    .select("id", { count: "exact", head: true })
    .eq("category", slug);

  const occupied = count ?? 0;

  if (occupied > 0) {
    if (!moveTo) {
      return NextResponse.json(
        {
          ok: false,
          error: `This category still holds ${occupied} item${occupied === 1 ? "" : "s"}. Choose where to move them first.`,
          occupied,
        },
        { status: 409 },
      );
    }
    if (moveTo === slug) {
      return NextResponse.json(
        { ok: false, error: "Choose a different category to move them to." },
        { status: 400 },
      );
    }

    const { data: target } = await admin
      .from("gallery_categories")
      .select("slug")
      .eq("slug", moveTo)
      .maybeSingle();

    if (!target) {
      return NextResponse.json({ ok: false, error: "That category no longer exists." }, { status: 400 });
    }

    // Append after whatever is already in the destination, preserving the order
    // they were in. Reusing their old positions would interleave two rails.
    const { data: last } = await admin
      .from("gallery_items")
      .select("position")
      .eq("category", moveTo)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: moving } = await admin
      .from("gallery_items")
      .select("id")
      .eq("category", slug)
      .order("position");

    let next = (last?.position ?? 0) + 1;
    for (const row of (moving ?? []) as { id: string }[]) {
      const { error } = await admin
        .from("gallery_items")
        // Groups belong to the old category and mean nothing in the new one.
        .update({ category: moveTo, group: null, position: next++ })
        .eq("id", row.id);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
    }
  }

  const { error } = await admin.from("gallery_categories").delete().eq("slug", slug);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/api/gallery");
  return NextResponse.json({ ok: true, moved: occupied, movedTo: occupied ? moveTo : null });
}
