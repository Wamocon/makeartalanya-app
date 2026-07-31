import type { SupabaseClient } from "@supabase/supabase-js";

/** requireAdmin() returns this id for the shared ADMIN_DASHBOARD_USER cookie login. */
export const LEGACY_ADMIN_ID = "legacy-admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Normalises an admin actor id for columns that reference `profiles(id)`.
 *
 * The cookie-based admin has no Supabase user and no profiles row, so its
 * sentinel id is not a UUID. Writing it raises `invalid input syntax for type
 * uuid`; NULL records the honest answer — "the shared studio login".
 */
export function actorId(id: string | undefined | null): string | null {
  if (!id || id === LEGACY_ADMIN_ID) return null;
  return UUID_RE.test(id) ? id : null;
}

/**
 * Reads a numeric value from `studio_settings`, falling back when the key is
 * missing or unparseable. Values are JSONB, so a plain number arrives as a
 * number and a quoted one as a string — Number() handles both.
 */
export async function getSetting(
  client: SupabaseClient,
  key: string,
  fallback: number,
): Promise<number> {
  const { data } = await client
    .from("studio_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  const parsed = Number(data?.value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/** Boolean flavour of `getSetting` (studio_settings stores JSON booleans). */
export async function getBoolSetting(
  client: SupabaseClient,
  key: string,
  fallback: boolean,
): Promise<boolean> {
  const { data } = await client
    .from("studio_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (data?.value === true || data?.value === "true") return true;
  if (data?.value === false || data?.value === "false") return false;
  return fallback;
}
