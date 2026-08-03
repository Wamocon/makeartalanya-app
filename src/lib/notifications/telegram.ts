/**
 * Telegram notification service.
 *
 * Recipients are resolved from studio_settings.telegram_admin_chat_ids, which
 * admins populate themselves by sending `/link <TELEGRAM_LINK_CODE>` to the bot
 * (see lib/telegram/bot.ts). TELEGRAM_ADMIN_CHAT_ID is still honoured as a
 * fallback for a fixed group chat.
 *
 * Why not env alone: a chat id does not exist until someone has written to the
 * bot, so it cannot be known at deploy time. This project shipped with
 * TELEGRAM_ADMIN_CHAT_ID="@makeartalanya_bot" — the bot's own username — and
 * every alert came back `403 Forbidden: the bot can't send messages to the bot`
 * into a console nobody was reading.
 */

import { createAdminClient } from "@/lib/supabase/admin";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export const TELEGRAM_CHATS_SETTING = "telegram_admin_chat_ids";

/** The bot's own numeric id is the part of the token before the colon. */
function botSelfId(): string | null {
  return BOT_TOKEN?.split(":")[0] ?? null;
}

/**
 * True when a configured value points at the bot itself. Sending there always
 * fails, so it is treated as "not configured" rather than as a recipient.
 */
function isSelfReference(chatId: string): boolean {
  const self = botSelfId();
  if (!self) return false;
  const normalised = chatId.trim().replace(/^@/, "").toLowerCase();
  return normalised === self || normalised.endsWith("_bot");
}

/**
 * Turns Telegram's error description into the thing you actually have to change.
 */
function explain(description: string, chatId: string): string | null {
  if (/can't send messages to the bot/i.test(description)) {
    return `TELEGRAM_ADMIN_CHAT_ID is "${chatId}", which resolves to the bot itself. It must be the id of the chat that should receive alerts. Easiest fix: send "/link <TELEGRAM_LINK_CODE>" to the bot from the chat that should get alerts.`;
  }
  if (/chat not found/i.test(description)) {
    return `Chat "${chatId}" is unknown to the bot. A chat only exists once someone has written to the bot, or the bot has been added to the group.`;
  }
  if (/bot was blocked/i.test(description)) {
    return "The recipient blocked the bot. Unblock it in Telegram, otherwise no alert will ever arrive.";
  }
  return null;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: { replyMarkup?: unknown; disablePreview?: boolean } = {},
): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN not set — skipping message");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: options.disablePreview ? { is_disabled: true } : undefined,
        reply_markup: options.replyMarkup,
      }),
    });

    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; description?: string; error_code?: number }
      | null;

    if (!res.ok || !body?.ok) {
      const description = body?.description ?? `HTTP ${res.status}`;
      console.error(`[Telegram] Message NOT delivered to ${chatId}: ${description}`);
      const hint = explain(description, String(chatId));
      if (hint) console.error(`[Telegram] Fix: ${hint}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Telegram] Message NOT delivered:", err);
    return false;
  }
}

/** Chat ids that should receive admin alerts: database first, env as fallback. */
export async function adminChatIds(): Promise<string[]> {
  const ids = new Set<string>();

  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin
      .from("studio_settings")
      .select("value")
      .eq("key", TELEGRAM_CHATS_SETTING)
      .maybeSingle();

    if (Array.isArray(data?.value)) {
      for (const id of data.value) {
        const s = String(id).trim();
        if (s && !isSelfReference(s)) ids.add(s);
      }
    }
  }

  if (ADMIN_CHAT_ID && !isSelfReference(ADMIN_CHAT_ID)) {
    ids.add(ADMIN_CHAT_ID.trim());
  }

  return [...ids];
}

/** Registers a chat as an alert recipient. Idempotent. */
export async function linkAdminChat(chatId: string | number): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { data } = await admin
    .from("studio_settings")
    .select("value")
    .eq("key", TELEGRAM_CHATS_SETTING)
    .maybeSingle();

  const current: string[] = Array.isArray(data?.value) ? data.value.map(String) : [];
  const id = String(chatId);
  if (current.includes(id)) return true;

  const { error } = await admin
    .from("studio_settings")
    .upsert(
      { key: TELEGRAM_CHATS_SETTING, value: [...current, id], updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  return !error;
}

/** Removes a chat from the alert recipients. */
export async function unlinkAdminChat(chatId: string | number): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { data } = await admin
    .from("studio_settings")
    .select("value")
    .eq("key", TELEGRAM_CHATS_SETTING)
    .maybeSingle();

  const current: string[] = Array.isArray(data?.value) ? data.value.map(String) : [];
  const next = current.filter((c) => c !== String(chatId));

  const { error } = await admin
    .from("studio_settings")
    .upsert(
      { key: TELEGRAM_CHATS_SETTING, value: next, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  return !error;
}

/** Fans an alert out to every registered admin chat. */
async function broadcastToAdmins(text: string): Promise<number> {
  const chats = await adminChatIds();

  if (chats.length === 0) {
    console.warn(
      "[Telegram] No admin chat registered — alert dropped. Send \"/link <TELEGRAM_LINK_CODE>\" to the bot to receive alerts.",
    );
    return 0;
  }

  const results = await Promise.all(chats.map((c) => sendTelegramMessage(c, text)));
  return results.filter(Boolean).length;
}

/**
 * Reports whether alerts can actually be delivered, rather than assuming so.
 */
export async function telegramSelfTest(): Promise<
  { ok: true; chats: number } | { ok: false; reason: string }
> {
  if (!BOT_TOKEN) return { ok: false, reason: "TELEGRAM_BOT_TOKEN is not set" };

  const me = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`).then((r) =>
    r.json().catch(() => null),
  );
  if (!me?.ok) {
    return { ok: false, reason: `Bot token rejected: ${me?.description ?? "unknown error"}` };
  }

  const chats = await adminChatIds();
  if (chats.length === 0) {
    return {
      ok: false,
      reason:
        'No admin chat registered. Send "/link <TELEGRAM_LINK_CODE>" to the bot from the chat that should receive alerts.',
    };
  }

  return { ok: true, chats: chats.length };
}

export async function telegramNotifyAdminNewBooking(booking: {
  guestName: string;
  guestPhone: string;
  language: string;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.makeartalanya.com";
  // wa.me needs a bare number. Telegram has no equivalent "open a chat with this
  // phone number" link, so WhatsApp stays the one-tap reply channel here.
  const digits = booking.guestPhone.replace(/[^\d]/g, "");

  const text = [
    "🎨 <b>New registration</b>",
    "",
    `👤 ${escapeHtml(booking.guestName)}`,
    `📞 ${escapeHtml(booking.guestPhone)}`,
    `🌐 ${escapeHtml(booking.language.toUpperCase())}`,
    "",
    // The child's name, birth date and health notes are deliberately absent —
    // a minor's data stays off third-party messaging (KVKK). Open the
    // RLS-protected dashboard for those.
    `<a href="${site}/admin/registrations">Open dashboard</a>`,
    digits ? `<a href="https://wa.me/${digits}">Message on WhatsApp</a>` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await broadcastToAdmins(text);
}

export async function telegramNotifyStatusChange(
  chatId: string,
  booking: { guestName: string; status: string; language: string },
) {
  const messages: Record<string, Record<string, string>> = {
    confirmed: {
      en: `✅ Hi ${booking.guestName}! Your booking at Make Art Studio has been confirmed. We'll be in touch with details soon!`,
      tr: `✅ Merhaba ${booking.guestName}! Make Art Studio'daki rezervasyonunuz onaylandı. Yakında detaylarla sizinle iletişime geçeceğiz!`,
      ru: `✅ Здравствуйте, ${booking.guestName}! Ваше бронирование в Make Art Studio подтверждено. Скоро свяжемся с деталями!`,
    },
    cancelled: {
      en: `❌ Hi ${booking.guestName}, your booking has been cancelled. Book again anytime at makeartalanya.com`,
      tr: `❌ Merhaba ${booking.guestName}, rezervasyonunuz iptal edildi. makeartalanya.com'dan tekrar rezervasyon yapabilirsiniz.`,
      ru: `❌ ${booking.guestName}, ваше бронирование отменено. Забронируйте снова на makeartalanya.com`,
    },
  };

  const lang = booking.language || "en";
  const text = messages[booking.status]?.[lang] || messages[booking.status]?.en;
  if (!text) return;

  await sendTelegramMessage(chatId, text);
}

/** Telegram's HTML parse mode only allows a small tag set; escape the rest. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
