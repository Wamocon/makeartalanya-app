import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

  // Fallback: check legacy admin_session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");
  if (sessionCookie?.value) {
    try {
      const username = process.env.ADMIN_DASHBOARD_USER;
      if (username) {
        const decoded = Buffer.from(sessionCookie.value, "base64").toString();
        const [sessionUser, timestamp] = decoded.split(":");
        const sessionAge = Date.now() - Number(timestamp);
        const maxAge = 8 * 60 * 60 * 1000; // 8 hours
        if (sessionUser === username && sessionAge <= maxAge) {
          return { user: { id: "legacy-admin", email: username } };
        }
      }
    } catch {
      // Invalid cookie — fall through to unauthorized
    }
  }

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
}
