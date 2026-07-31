import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { signAdminSession, ADMIN_SESSION_MAX_AGE_MS } from "@/lib/admin-session";

/** Constant-time compare so a wrong password can't be narrowed down by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  try {
    // Throttle credential stuffing: 10 attempts per IP per 5 minutes.
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const { allowed, resetIn } = rateLimit(`admin-login:${ip}`, {
      maxRequests: 10,
      windowMs: 5 * 60_000,
    });
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } },
      );
    }

    const { username, password } = await req.json();

    const validUser = process.env.ADMIN_DASHBOARD_USER;
    const validPass = process.env.ADMIN_DASHBOARD_PASSWORD;

    if (!validUser || !validPass) {
      return NextResponse.json(
        { ok: false, error: "Admin credentials not configured on server" },
        { status: 500 },
      );
    }

    if (
      typeof username === "string" &&
      typeof password === "string" &&
      safeEqual(username, validUser) &&
      safeEqual(password, validPass)
    ) {
      const token = await signAdminSession(username);
      if (!token) {
        console.error("ADMIN_SESSION_SECRET is not set — refusing to issue a session.");
        return NextResponse.json(
          { ok: false, error: "Admin sessions are not configured on server" },
          { status: 500 },
        );
      }

      const cookieStore = await cookies();
      cookieStore.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ADMIN_SESSION_MAX_AGE_MS / 1000,
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid username or password" },
      { status: 401 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
