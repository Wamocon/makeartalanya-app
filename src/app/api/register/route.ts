import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { registrationSchema } from "@/lib/schemas";
import { createRegistration } from "@/lib/registrations/create";
import { botUsername } from "@/lib/telegram/parent-link";

export async function POST(req: Request) {
  try {
    // Rate limit: 5 registrations per IP per minute.
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const { allowed, resetIn } = rateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } },
      );
    }

    const json = await req.json();
    const parsed = registrationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please check the form and fill in all required fields.", code: "VALIDATION" },
        { status: 400 },
      );
    }

    const result = await createRegistration(parsed.data, { ip, source: { kind: "web" } });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    // Deep link the parent can tap to receive updates. Telegram forbids the bot
    // from writing first, so this button — which makes the parent send
    // "/start <token>" — is the only way to open that channel.
    let telegramLink: string | null = null;
    if (result.telegramToken) {
      const username = await botUsername();
      if (username) {
        telegramLink = `https://t.me/${username}?start=${result.telegramToken}`;
      }
    }

    return NextResponse.json({ ok: true, telegramLink });
  } catch (err) {
    console.error("Registration API error:", err);
    return NextResponse.json({ ok: false, error: "Unexpected server error." }, { status: 500 });
  }
}
