import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Does this category exist?
 *
 * Categories moved from a compile-time enum into a table, so the zod schemas can
 * only check that a slug is shaped like a slug. Existence is checked here, and
 * again by the foreign key underneath. Doing it here as well is not redundant:
 * the FK reports a 23503 that surfaces as a 500, and "internal server error" is
 * the wrong thing to show someone who picked a category that was deleted in
 * another tab thirty seconds ago.
 */
export async function categoryExists(
  admin: SupabaseClient,
  slug: string,
): Promise<boolean> {
  const { data } = await admin
    .from("gallery_categories")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  return Boolean(data);
}

/** Same check for a set, in one round-trip. Returns the slugs that do not exist. */
export async function missingCategories(
  admin: SupabaseClient,
  slugs: string[],
): Promise<string[]> {
  const unique = [...new Set(slugs)];
  if (!unique.length) return [];
  const { data } = await admin
    .from("gallery_categories")
    .select("slug")
    .in("slug", unique);
  const found = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  return unique.filter((s) => !found.has(s));
}
