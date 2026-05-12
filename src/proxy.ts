import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

export function proxy(req: NextRequest) {
  const username = process.env.ADMIN_DASHBOARD_USER;
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;

  // Allow access when credentials are not configured yet.
  if (!username || !password) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin Dashboard"' },
    });
  }

  try {
    const encoded = authHeader.split(" ")[1] || "";
    const decoded = atob(encoded);
    const [providedUser, providedPassword] = decoded.split(":");

    if (providedUser === username && providedPassword === password) {
      return NextResponse.next();
    }
  } catch {
    // Fall through to unauthorized response.
  }

  return new NextResponse("Invalid credentials", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin Dashboard"' },
  });
}
