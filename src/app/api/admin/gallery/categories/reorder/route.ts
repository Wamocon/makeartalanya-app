import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { reorderCategoriesSchema } from "@/lib/gallery/schemas";

/**
 * Reorders the rails themselves — same whole-list-as-intent shape as the item
 * reorder, so two concurrent drags converge rather than compound.
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

  const parsed = reorderCategoriesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { slugs } = parsed.data;
  if (new Set(slugs).size !== slugs.length) {
    return NextResponse.json({ ok: false, error: "Duplicate categories." }, { status: 400 });
  }

  const { error } = await admin.rpc("fn_gallery_categories_reorder", { p_slugs: slugs });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/api/gallery");
  return NextResponse.json({ ok: true, count: slugs.length });
}
