import { NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram/bot";

/**
 * POST /api/telegram/webhook — where Telegram delivers incoming messages.
 *
 * Register it once per environment with:
 *   node scripts/telegram-setup.js set https://makeartalanya.com
 *
 * Authenticity: setWebhook is called with a secret_token, which Telegram then
 * echoes in X-Telegram-Bot-Api-Secret-Token on every request. The URL is public,
 * so without this check anyone could POST fake updates and make the bot answer
 * as the studio.
 *
 * Always answers 200. A non-2xx makes Telegram retry the same update for hours,
 * so a message that fails to process is logged and acknowledged rather than
 * queued forever.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  if (!expected) {
    console.error("[telegram] TELEGRAM_WEBHOOK_SECRET is not set — refusing updates");
    return NextResponse.json({ ok: true });
  }

  const provided = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    console.warn("[telegram] rejected update with bad secret token");
    // 401 rather than 200: this is not Telegram, so there is nothing to retry.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    await handleTelegramUpdate(update);
  } catch (err) {
    console.error("[telegram] handler failed:", err);
  }

  return NextResponse.json({ ok: true });
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
