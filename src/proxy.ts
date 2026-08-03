import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image, favicon.ico, public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

// Simple in-memory rate limiter (per-IP, per-path prefix)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP on public APIs

function isRateLimited(ip: string, path: string): boolean {
  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Periodic cleanup to prevent memory leak (runs lazily)
let lastCleanup = Date.now();
function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Security headers on all responses
  const response = await routeRequest(req, pathname);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

async function routeRequest(req: NextRequest, pathname: string): Promise<NextResponse> {
  // Public routes — no auth needed
  if (
    pathname === "/" ||
    pathname === "/schedule" ||
    pathname.startsWith("/schedule/") ||
    pathname === "/privacy" ||
    pathname === "/imprint" ||
    pathname === "/terms" ||
    pathname === "/rules" ||
    pathname === "/cookies" ||
    pathname === "/kayit" ||
    pathname === "/handbook" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/schedule/public") ||
    pathname.startsWith("/api/cron/") ||
    // Telegram authenticates itself with a secret token the route checks. Going
    // through the Supabase session refresh would add a pointless round trip to
    // every single update, on a webhook Telegram retries for hours if it is slow.
    pathname === "/api/telegram/webhook"
  ) {
    return NextResponse.next();
  }

  // Public APIs with rate limiting
  if (
    pathname === "/api/booking" ||
    pathname === "/api/enroll" ||
    pathname === "/api/register"
  ) {
    cleanupRateLimitMap();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    if (isRateLimited(ip, pathname)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    return NextResponse.next();
  }

  // Admin login page — allow access
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Admin API routes — require admin authentication
  if (pathname.startsWith("/api/admin/")) {
    return updateSession(req);
  }

  // All protected routes (/my/*, /admin/*, etc.) — run Supabase session check
  return updateSession(req);
}
