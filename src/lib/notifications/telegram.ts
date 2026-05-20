/**
 * Telegram notification service.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID in environment variables.
 * Create a bot via @BotFather on Telegram (free, unlimited messages).
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

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

    if (!res.ok) {
      const err = await res.text();
      console.error("[Telegram] Failed:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Telegram] Error:", err);
    return false;
  }
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
