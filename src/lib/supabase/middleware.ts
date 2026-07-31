import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin-session";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — validates JWT
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected: /my/* requires auth
  if (pathname.startsWith("/my")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protected: /trainer/* requires auth (role check done in page)
  if (pathname.startsWith("/trainer")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protected: /admin/* requires admin/trainer role (Supabase auth OR signed cookie).
  // The cookie is HMAC-verified — see lib/admin-session.ts. A merely *present*
  // cookie proves nothing.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminSession = await verifyAdminSession(
      request.cookies.get("admin_session")?.value,
    );
    const hasValidCookie =
      adminSession !== null &&
      adminSession.username === process.env.ADMIN_DASHBOARD_USER;

    if (!user) {
      if (!hasValidCookie) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    } else {
      // Logged in via Supabase — the profiles table is the ONLY authority here.
      // user_metadata is writable by the account holder itself
      // (supabase.auth.updateUser({ data: { role: 'admin' } })), so trusting it
      // would let any registered parent promote themselves to admin.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const isStaff = profile?.role === "admin" || profile?.role === "trainer";

      if (!isStaff && !hasValidCookie) {
        // Regular user trying to access admin — send them to their dashboard.
        const url = request.nextUrl.clone();
        url.pathname = "/my";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
