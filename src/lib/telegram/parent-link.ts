import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage, escapeHtml } from "@/lib/notifications/telegram";

/**
 * Deep-link binding between a /kayit registration and a parent's Telegram chat.
 *
 * A bot cannot message someone who has not written to it first, so there is no
 * way to "send the parent a Telegram message" straight after they submit the
 * form. Instead the success screen offers a link to
 *   https://t.me/<bot>?start=<token>
 * Tapping it makes Telegram send "/start <token>" *from the parent*, which both
 * grants the bot permission to reply and proves consent. handleStartToken()
 * exchanges that token for the chat id.
 */

/** Tokens older than this are refused, so a leaked link cannot be used forever. */
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type Lang = "tr" | "en" | "ru";

/** URL-safe and within Telegram's 64-char start-payload limit. */
export function newLinkToken(): string {
  return randomBytes(24).toString("base64url");
}

/** The bot username, derived from the token so it cannot drift out of sync. */
export async function botUsername(): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      next: { revalidate: 3600 },
    });
    const body = await res.json();
    return body?.ok ? (body.result.username as string) : null;
  } catch {
    return null;
  }
}

const CONFIRM: Record<Lang, (child: string) => string> = {
  tr: (child) =>
    [
      "✅ <b>Bağlantı kuruldu!</b>",
      "",
      `${escapeHtml(child)} için kaydınızı aldık.`,
      "Kaydınızla ilgili gelişmeleri buradan ileteceğiz.",
      "",
      "Bildirimleri durdurmak için /stop yazabilirsiniz.",
    ].join("\n"),
  en: (child) =>
    [
      "✅ <b>You're connected!</b>",
      "",
      `We've received your registration for ${escapeHtml(child)}.`,
      "We'll send updates about it here.",
      "",
      "Send /stop at any time to turn these off.",
    ].join("\n"),
  ru: (child) =>
    [
      "✅ <b>Связь установлена!</b>",
      "",
      `Мы получили вашу заявку для ${escapeHtml(child)}.`,
      "Будем присылать обновления сюда.",
      "",
      "Отправьте /stop, чтобы отключить уведомления.",
    ].join("\n"),
};

/**
 * Redeems a deep-link token for `chatId`. Returns a reply to send, or null when
 * the token is unknown/expired/already used — the caller then falls through to
 * the normal /start greeting rather than confirming something that didn't happen.
 */
export async function handleStartToken(
  token: string,
  chatId: number | string,
): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: registration } = await admin
    .from("registrations")
    .select("id, child_name, preferred_language, created_at, telegram_chat_id")
    .eq("telegram_link_token", token)
    .maybeSingle();

  if (!registration) return null;

  if (Date.now() - new Date(registration.created_at).getTime() > TOKEN_TTL_MS) {
    return null;
  }

  const lang = (["tr", "en", "ru"].includes(registration.preferred_language)
    ? registration.preferred_language
    : "tr") as Lang;

  const { error } = await admin
    .from("registrations")
    .update({
      telegram_chat_id: String(chatId),
      telegram_linked_at: new Date().toISOString(),
      // Burn the token: single use, so a forwarded link cannot rebind the row.
      telegram_link_token: null,
    })
    .eq("id", registration.id);

  if (error) return null;

  return CONFIRM[lang](registration.child_name);
}

/** Stops updates for every registration bound to this chat. */
export async function unlinkParentChat(chatId: number | string): Promise<number> {
  const admin = createAdminClient();
  if (!admin) return 0;

  const { data } = await admin
    .from("registrations")
    .update({ telegram_chat_id: null, telegram_linked_at: null })
    .eq("telegram_chat_id", String(chatId))
    .select("id");

  return data?.length ?? 0;
}

const STATUS_COPY: Record<
  string,
  Record<Lang, (child: string) => string> | undefined
> = {
  contacted: {
    tr: (c) => `📞 ${escapeHtml(c)} için kaydınızı inceledik ve sizinle iletişime geçiyoruz. Kısa süre içinde WhatsApp'tan yazacağız.`,
    en: (c) => `📞 We've reviewed the registration for ${escapeHtml(c)} and are getting in touch. We'll message you on WhatsApp shortly.`,
    ru: (c) => `📞 Мы рассмотрели заявку для ${escapeHtml(c)} и свяжемся с вами. Скоро напишем в WhatsApp.`,
  },
  enrolled: {
    tr: (c) => `🎉 Harika haber! ${escapeHtml(c)} artık Make Art Studio'ya kayıtlı. Görüşmek üzere!`,
    en: (c) => `🎉 Great news! ${escapeHtml(c)} is now enrolled at Make Art Studio. See you soon!`,
    ru: (c) => `🎉 Отличная новость! ${escapeHtml(c)} зачислен(а) в Make Art Studio. До скорой встречи!`,
  },
};

/**
 * Tells a parent their registration moved on. Silent when they never linked a
 * chat, or when the new status has no message worth sending (`new`, `archived`).
 */
export async function notifyParentStatusChange(
  registrationId: string,
  status: string,
): Promise<boolean> {
  const copy = STATUS_COPY[status];
  if (!copy) return false;

  const admin = createAdminClient();
  if (!admin) return false;

  const { data: registration } = await admin
    .from("registrations")
    .select("child_name, preferred_language, telegram_chat_id")
    .eq("id", registrationId)
    .maybeSingle();

  if (!registration?.telegram_chat_id) return false;

  const lang = (["tr", "en", "ru"].includes(registration.preferred_language)
    ? registration.preferred_language
    : "tr") as Lang;

  return sendTelegramMessage(
    registration.telegram_chat_id,
    copy[lang](registration.child_name),
    { disablePreview: true },
  );
}
