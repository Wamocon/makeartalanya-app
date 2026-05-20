import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // Protected: /admin/* requires admin/trainer role (Supabase auth OR legacy cookie)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      // Check legacy admin_session cookie
      const sessionCookie = request.cookies.get("admin_session");
      if (!sessionCookie?.value) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set("redirect", "/admin");
        return NextResponse.redirect(url);
      }
      // Validate legacy cookie
      try {
        const username = process.env.ADMIN_DASHBOARD_USER;
        const decoded = atob(sessionCookie.value);
        const [sessionUser, timestamp] = decoded.split(":");
        const sessionAge = Date.now() - Number(timestamp);
        const maxAge = 8 * 60 * 60 * 1000;
        if (sessionUser !== username || sessionAge > maxAge) {
          const url = request.nextUrl.clone();
          url.pathname = "/auth/login";
          url.searchParams.set("redirect", "/admin");
          return NextResponse.redirect(url);
        }
      } catch {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set("redirect", "/admin");
        return NextResponse.redirect(url);
      }
    } else {
      // User is logged in via Supabase — check role
      const role = user.user_metadata?.role;
      if (role !== "admin" && role !== "trainer") {
        // Not an admin — also check profiles table role via legacy cookie fallback
        const sessionCookie = request.cookies.get("admin_session");
        if (!sessionCookie?.value) {
          // Regular user trying to access admin — redirect to their dashboard
          const url = request.nextUrl.clone();
          url.pathname = "/my";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
