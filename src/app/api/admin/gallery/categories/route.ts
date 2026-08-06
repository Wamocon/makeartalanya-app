import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCategorySchema } from "@/lib/gallery/schemas";
import {
  GALLERY_CATEGORY_COLUMNS,
  rowToCategory,
  slugify,
  type GalleryCategoryRow,
} from "@/lib/gallery/types";

/** GET every category with its item count; POST creates one. */
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Server not configured." }, { status: 500 });
  }

  const [{ data: rows, error }, { data: items }] = await Promise.all([
    admin.from("gallery_categories").select(GALLERY_CATEGORY_COLUMNS).order("position"),
    admin.from("gallery_items").select("category"),
  ]);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const i of (items ?? []) as { category: string }[]) {
    counts.set(i.category, (counts.get(i.category) ?? 0) + 1);
  }

  return NextResponse.json({
    ok: true,
    categories: (rows as GalleryCategoryRow[]).map((r) => ({
      ...rowToCategory(r),
      count: counts.get(r.slug) ?? 0,
    })),
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

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { label } = parsed.data;

  // The slug is derived once and then frozen, so it is worth deriving well.
  // English first because it is the most likely to be plain ASCII; the other two
  // are transliterated rather than stripped, but "gallery-<n>" is the honest
  // fallback when a label is punctuation or emoji and slugifies to nothing.
  let base =
    parsed.data.slug ?? slugify(label.en) ?? "";
  if (!base) base = slugify(label.tr) || slugify(label.ru);
  if (!base) base = "category";

  // Slugs are permanent and public, so a collision cannot be resolved by
  // overwriting someone else's rail — suffix instead.
  const { data: existing } = await admin
    .from("gallery_categories")
    .select("slug")
    .like("slug", `${base}%`);

  const taken = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

  const { data: last } = await admin
    .from("gallery_categories")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await admin
    .from("gallery_categories")
    .insert({ slug, label, position: (last?.position ?? 0) + 1 })
    .select(GALLERY_CATEGORY_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/api/gallery");
  return NextResponse.json({
    ok: true,
    category: { ...rowToCategory(data as GalleryCategoryRow), count: 0 },
  });
}
