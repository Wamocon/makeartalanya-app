import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-session";

/**
 * Verifies the current request is from an authenticated admin/trainer user.
 * Supports both Supabase auth AND legacy admin_session cookie.
 * Returns the user if authorized, or a 401/403 NextResponse if not.
 */
export async function requireAdmin(): Promise<
  | { user: { id: string; email?: string }; error?: never }
  | { user?: never; error: NextResponse }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check role in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile && ["admin", "trainer"].includes(profile.role)) {
      return { user };
    }
  }

  // Fallback: signed admin_session cookie (see lib/admin-session.ts).
  const cookieStore = await cookies();
  const session = await verifyAdminSession(cookieStore.get("admin_session")?.value);
  if (session && session.username === process.env.ADMIN_DASHBOARD_USER) {
    return { user: { id: "legacy-admin", email: session.username } };
  }

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
}

/**
 * Server-Component flavour of `requireAdmin` — redirects instead of returning a
 * JSON response, and hands back a service-role client.
 *
 * Admin pages must not read through the RLS-scoped client: an admin signed in
 * via the admin_session cookie has no Supabase JWT, so `is_admin()` is false and
 * every policy-protected query comes back empty with no error. Pages rendered
 * that way look like an empty studio rather than a broken one.
 */
export async function requireAdminPage() {
  const auth = await requireAdmin();
  if (auth.error) redirect("/admin/login");

  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured — admin pages cannot load data.",
    );
  }

  return { admin, user: auth.user };
}
