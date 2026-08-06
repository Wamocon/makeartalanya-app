import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  GALLERY_ROW_COLUMNS,
  GALLERY_CATEGORY_COLUMNS,
  rowToItem,
  rowToCategory,
  type GalleryItemRow,
  type GalleryCategoryRow,
} from "@/lib/gallery/types";

/**
 * The public gallery manifest.
 *
 * Read with the publishable key, not the service role: the only rows this should
 * ever expose are the ones RLS already marks visible, and routing that through
 * the anon key means a mistake here surfaces as an empty gallery rather than as
 * leaked hidden content.
 *
 * Cached for a minute at the edge with a long stale-while-revalidate. The
 * gallery is far below the fold on a page most visitors bounce off — serving a
 * slightly stale order to the handful of people mid-reorder is a much better
 * trade than a database round-trip on every homepage hit.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const revalidate = 60;

export async function GET() {
  if (!SUPABASE_URL || !PUBLIC_KEY) {
    return NextResponse.json({ ok: false, error: "Not configured." }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, PUBLIC_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [itemsRes, categoriesRes] = await Promise.all([
    supabase
      .from("gallery_items")
      .select(GALLERY_ROW_COLUMNS)
      .eq("visible", true)
      .order("position", { ascending: true }),
    supabase
      .from("gallery_categories")
      .select(GALLERY_CATEGORY_COLUMNS)
      .eq("visible", true)
      .order("position", { ascending: true }),
  ]);

  const error = itemsRes.error ?? categoriesRes.error;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const items = (itemsRes.data as GalleryItemRow[]).map(rowToItem);

  // Only categories that actually have something visible in them are returned —
  // an empty rail with a heading and "0 photos" reads as a broken page rather
  // than an empty one. The order is the admin's, from the category table.
  const categories = (categoriesRes.data as GalleryCategoryRow[])
    .map(rowToCategory)
    .filter((c) => items.some((i) => i.category === c.slug))
    .map((c) => ({
      slug: c.slug,
      label: c.label,
      count: items.filter((i) => i.category === c.slug).length,
    }));

  return NextResponse.json(
    { ok: true, items, categories },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
}
