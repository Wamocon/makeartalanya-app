import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const validUser = process.env.ADMIN_DASHBOARD_USER;
    const validPass = process.env.ADMIN_DASHBOARD_PASSWORD;

    if (!validUser || !validPass) {
      return NextResponse.json(
        { ok: false, error: "Admin credentials not configured on server" },
        { status: 500 }
      );
    }

    if (username === validUser && password === validPass) {
      // Create a simple session token
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

      const cookieStore = await cookies();
      cookieStore.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid username or password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
