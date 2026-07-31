/**
 * Telegram notification service.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID in environment variables.
 * Create a bot via @BotFather on Telegram (free, unlimited messages).
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

/**
 * Turns Telegram's error description into the thing you actually have to change.
 * Without this the log says "Forbidden: the bot can't send messages to the bot"
 * and someone has to work out that TELEGRAM_ADMIN_CHAT_ID holds the bot's own
 * @username instead of a chat id — which is the state this project shipped in.
 */
function explain(description: string, chatId: string): string | null {
  if (/can't send messages to the bot/i.test(description)) {
    return `TELEGRAM_ADMIN_CHAT_ID is "${chatId}", which resolves to the bot itself. It must be the id of the chat that should receive alerts: open Telegram, send the bot a message, then read the numeric id from https://api.telegram.org/bot<token>/getUpdates. For a group, add the bot to it and use the group's (negative) id.`;
  }
  if (/chat not found/i.test(description)) {
    return `TELEGRAM_ADMIN_CHAT_ID "${chatId}" is unknown to the bot. A chat only exists once someone has written to the bot, or the bot has been added to the group.`;
  }
  if (/bot was blocked/i.test(description)) {
    return "The recipient blocked the bot. Unblock it in Telegram, otherwise no alert will ever arrive.";
  }
  return null;
}

async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN not set — skipping message");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; description?: string; error_code?: number }
      | null;

    if (!res.ok || !body?.ok) {
      const description = body?.description ?? `HTTP ${res.status}`;
      console.error(`[Telegram] Alert NOT delivered: ${description}`);
      const hint = explain(description, chatId);
      if (hint) console.error(`[Telegram] Fix: ${hint}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Telegram] Alert NOT delivered:", err);
    return false;
  }
}

/**
 * Sends a message and reports what happened, so a caller can react instead of
 * discovering months later that no alert ever arrived. Used by the health check.
 */
export async function telegramSelfTest(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  if (!BOT_TOKEN) return { ok: false, reason: "TELEGRAM_BOT_TOKEN is not set" };
  if (!ADMIN_CHAT_ID) return { ok: false, reason: "TELEGRAM_ADMIN_CHAT_ID is not set" };

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID }),
  });
  const body = (await res.json().catch(() => null)) as
    | { ok?: boolean; description?: string; result?: { id?: number; type?: string } }
    | null;

  if (!body?.ok) {
    const description = body?.description ?? `HTTP ${res.status}`;
    return { ok: false, reason: explain(description, ADMIN_CHAT_ID) ?? description };
  }
  // getChat happily resolves the bot's own username, so check for that too.
  if (body.result?.type === "private" && String(body.result.id) === BOT_TOKEN.split(":")[0]) {
    return {
      ok: false,
      reason: explain("can't send messages to the bot", ADMIN_CHAT_ID)!,
    };
  }
  return { ok: true };
}

export async function telegramNotifyAdminNewBooking(booking: {
  guestName: string;
  guestPhone: string;
  language: string;
}) {
  if (!ADMIN_CHAT_ID) return;

  const text = [
    "🎨 <b>New Booking Request</b>",
    "",
    `👤 <b>Name:</b> ${booking.guestName}`,
    `📞 <b>Phone:</b> ${booking.guestPhone}`,
    `🌐 <b>Language:</b> ${booking.language.toUpperCase()}`,
    "",
    "Go to admin panel to confirm.",
  ].join("\n");

  await sendTelegramMessage(ADMIN_CHAT_ID, text);
}

export async function telegramNotifyStatusChange(
  chatId: string,
  booking: { guestName: string; status: string; language: string }
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
