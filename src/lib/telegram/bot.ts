/**
 * Telegram bot conversation handler.
 *
 * Until now the integration was outbound-only: it pushed admin alerts and had no
 * way to receive anything, so writing to the bot got no reply at all. This is the
 * inbound half, shared by the production webhook (app/api/telegram/webhook) and
 * the local long-poll runner (scripts/telegram-poll.js) so both behave the same.
 *
 * Two audiences:
 *  - Studio staff, once they have linked their chat with /link <code>. They get
 *    /today, /new and /stats so the studio can be checked without a laptop.
 *  - Everyone else — parents who found the bot. They get studio contact details
 *    and a link to the registration form, in their Telegram language.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { handleStartToken, unlinkParentChat } from "@/lib/telegram/parent-link";
import {
  sendTelegramMessage,
  answerCallbackQuery,
  adminChatIds,
  linkAdminChat,
  unlinkAdminChat,
  escapeHtml,
} from "@/lib/notifications/telegram";
import {
  startLanguagePick,
  handleCallback,
  handleFlowText,
  cancelFlow,
} from "@/lib/telegram/flow-runner";

export interface TelegramUpdate {
  update_id?: number;
  message?: {
    message_id?: number;
    from?: { id: number; first_name?: string; username?: string; language_code?: string };
    chat: { id: number; type: string; title?: string; first_name?: string };
    text?: string;
    date?: number;
  };
  callback_query?: {
    id: string;
    from?: { id: number; language_code?: string };
    message?: { chat: { id: number } };
    data?: string;
  };
}

type Lang = "tr" | "en" | "ru";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://makeartalanya.com";
const WHATSAPP = "+90 551 674 55 15";

function pickLang(code: string | undefined): Lang {
  const c = (code ?? "").slice(0, 2).toLowerCase();
  if (c === "tr") return "tr";
  if (c === "ru") return "ru";
  return "en";
}

const COPY: Record<Lang, Record<string, string>> = {
  tr: {
    greet: "Merhaba! 👋 Ben <b>Make Art Studio Alanya</b> botuyum.",
    publicHelp: [
      "Size şu konularda yardımcı olabilirim:",
      "",
      `📝 Kayıt formu: ${SITE_URL}/kayit`,
      `🗓 Ders programı: ${SITE_URL}/schedule`,
      `💬 WhatsApp: ${WHATSAPP}`,
      "",
      "Sorularınız için bize WhatsApp'tan yazabilirsiniz — en kısa sürede dönüş yapıyoruz.",
    ].join("\n"),
    unknown: "Bu komutu bilmiyorum. /help yazarak neler yapabileceğimi görebilirsiniz.",
    updatesOff: "🔕 Kayıt bildirimleri kapatıldı.",
    nothingToStop: "Bu sohbete bağlı bir kayıt bulunamadı.",
    linked: "✅ Bu sohbet artık yönetici bildirimlerini alacak.",
    unlinked: "🔕 Bu sohbet artık yönetici bildirimi almayacak.",
    badCode: "❌ Kod hatalı.",
  },
  en: {
    greet: "Hello! 👋 I'm the <b>Make Art Studio Alanya</b> bot.",
    publicHelp: [
      "Here's what I can help with:",
      "",
      `📝 Registration form: ${SITE_URL}/kayit`,
      `🗓 Class schedule: ${SITE_URL}/schedule`,
      `💬 WhatsApp: ${WHATSAPP}`,
      "",
      "For anything else just message us on WhatsApp — we reply quickly.",
    ].join("\n"),
    unknown: "I don't know that command. Send /help to see what I can do.",
    updatesOff: "🔕 Registration updates turned off.",
    nothingToStop: "No registration is linked to this chat.",
    linked: "✅ This chat will now receive admin alerts.",
    unlinked: "🔕 This chat will no longer receive admin alerts.",
    badCode: "❌ Wrong code.",
  },
  ru: {
    greet: "Здравствуйте! 👋 Я бот <b>Make Art Studio Alanya</b>.",
    publicHelp: [
      "Вот чем я могу помочь:",
      "",
      `📝 Форма записи: ${SITE_URL}/kayit`,
      `🗓 Расписание: ${SITE_URL}/schedule`,
      `💬 WhatsApp: ${WHATSAPP}`,
      "",
      "По другим вопросам напишите нам в WhatsApp — мы быстро отвечаем.",
    ].join("\n"),
    unknown: "Я не знаю такую команду. Отправьте /help, чтобы посмотреть возможности.",
    updatesOff: "🔕 Уведомления по заявке отключены.",
    nothingToStop: "К этому чату не привязана заявка.",
    linked: "✅ Этот чат будет получать уведомления администратора.",
    unlinked: "🔕 Этот чат больше не будет получать уведомления.",
    badCode: "❌ Неверный код.",
  },
};

const ADMIN_HELP = [
  "<b>Studio commands</b>",
  "",
  "/today — today's classes and who is booked",
  "/new — new registrations waiting for a reply",
  "/stats — bookings, clients and subscriptions at a glance",
  "/unlink — stop sending alerts to this chat",
  "/id — show this chat's id",
].join("\n");

async function isAdminChat(chatId: number): Promise<boolean> {
  const chats = await adminChatIds();
  return chats.includes(String(chatId));
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

async function todayReport(): Promise<string> {
  const admin = createAdminClient();
  if (!admin) return "Server is not configured for database access.";

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const { data: sessions } = await admin
    .from("class_sessions")
    .select("id, starts_at, enrolled_count, max_capacity, status, class_types(name_en)")
    .gte("starts_at", start)
    .lt("starts_at", end)
    .order("starts_at");

  if (!sessions || sessions.length === 0) {
    return "📅 <b>Today</b>\n\nNo classes scheduled.";
  }

  const lines = ["📅 <b>Today's classes</b>", ""];
  for (const s of sessions) {
    const rel = s.class_types as unknown;
    const ct = (Array.isArray(rel) ? rel[0] : rel) as { name_en?: string } | null;
    const cancelled = s.status === "cancelled" ? " — <i>cancelled</i>" : "";
    lines.push(
      `${fmtTime(s.starts_at)} · ${escapeHtml(ct?.name_en ?? "Class")} · ${s.enrolled_count}/${s.max_capacity}${cancelled}`,
    );
  }

  const total = sessions
    .filter((s) => s.status !== "cancelled")
    .reduce((sum, s) => sum + (s.enrolled_count ?? 0), 0);
  lines.push("", `👧 ${total} student${total === 1 ? "" : "s"} expected`);

  return lines.join("\n");
}

async function newRegistrations(): Promise<string> {
  const admin = createAdminClient();
  if (!admin) return "Server is not configured for database access.";

  const { data } = await admin
    .from("registrations")
    .select("parent_name, child_name, branch, parent_phone, created_at")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!data || data.length === 0) {
    return "📝 <b>Registrations</b>\n\nNothing new — all caught up.";
  }

  const lines = [`📝 <b>${data.length} new registration${data.length === 1 ? "" : "s"}</b>`, ""];
  for (const r of data) {
    lines.push(
      `• ${escapeHtml(r.child_name)} (${escapeHtml(r.branch)}) — ${escapeHtml(r.parent_name)}, ${escapeHtml(r.parent_phone)}`,
    );
  }
  lines.push("", `${SITE_URL}/admin/registrations`);
  return lines.join("\n");
}

async function stats(): Promise<string> {
  const admin = createAdminClient();
  if (!admin) return "Server is not configured for database access.";

  const weekAhead = new Date(Date.now() + 7 * 86_400_000).toISOString();

  const [clients, activeSubs, upcoming, newRegs] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin
      .from("class_sessions")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", new Date().toISOString())
      .lt("starts_at", weekAhead)
      .eq("status", "scheduled"),
    admin.from("registrations").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return [
    "📊 <b>Studio at a glance</b>",
    "",
    `👥 Clients: ${clients.count ?? 0}`,
    `🎟 Active subscriptions: ${activeSubs.count ?? 0}`,
    `🗓 Classes next 7 days: ${upcoming.count ?? 0}`,
    `📝 New registrations: ${newRegs.count ?? 0}`,
  ].join("\n");
}

/**
 * Handles one update. Returns the text sent, or null when nothing was sent —
 * used by tests and by the poller's log output.
 */
export async function handleTelegramUpdate(update: TelegramUpdate): Promise<string | null> {
  // Inline buttons arrive as callback_query, not as a message. Acknowledge the
  // tap first so the button stops spinning, then act on it.
  const callback = update.callback_query;
  if (callback) {
    const cbChatId = callback.message?.chat.id ?? callback.from?.id;
    await answerCallbackQuery(callback.id);
    if (cbChatId && callback.data) {
      await handleCallback(cbChatId, callback.data);
    }
    return null;
  }

  const message = update.message;
  if (!message?.text) return null;

  const chatId = message.chat.id;
  const lang = pickLang(message.from?.language_code);
  const t = COPY[lang];
  const text = message.text.trim();

  // "/cmd@BotName arg" → cmd, arg
  const [rawCmd, ...args] = text.split(/\s+/);
  const command = rawCmd.toLowerCase().split("@")[0];

  const admin = await isAdminChat(chatId);

  // Mid-registration, a plain message is an answer to the question just asked —
  // not a command and not a reason to show the generic help text.
  if (!command.startsWith("/") && (await handleFlowText(chatId, text))) {
    return null;
  }

  let reply: string;

  switch (command) {
    case "/cancel":
    case "/iptal":
    case "/otmena":
      await cancelFlow(chatId);
      return null;

    case "/start": {
      // Telegram appends the deep-link payload to /start. A parent arriving from
      // the /kayit success screen carries a one-time token here — and this
      // message is what grants the bot permission to reply to them at all.
      const payload = args.join(" ").trim();
      if (payload) {
        const confirmation = await handleStartToken(payload, chatId);
        if (confirmation) {
          reply = confirmation;
          break;
        }
        // Unknown, expired or already-redeemed token: fall through to the normal
        // greeting rather than confirming a link that did not happen.
      }
      if (admin) {
        reply = `${t.greet}\n\n${ADMIN_HELP}`;
        break;
      }
      // A parent: offer the language picker, which leads into the menu and the
      // registration conversation.
      await startLanguagePick(chatId);
      return null;
    }

    case "/stop": {
      const stopped = await unlinkParentChat(chatId);
      reply = stopped > 0 ? t.updatesOff : t.nothingToStop;
      break;
    }

    case "/help":
      reply = admin ? ADMIN_HELP : t.publicHelp;
      break;

    case "/id":
      reply = `Chat id: <code>${chatId}</code>\nType: ${escapeHtml(message.chat.type)}`;
      break;

    case "/link": {
      const expected = process.env.TELEGRAM_LINK_CODE?.trim();
      if (!expected) {
        reply = "Linking is disabled: TELEGRAM_LINK_CODE is not set on the server.";
        break;
      }
      if (args.join(" ").trim() !== expected) {
        reply = t.badCode;
        break;
      }
      reply = (await linkAdminChat(chatId)) ? `${t.linked}\n\n${ADMIN_HELP}` : "Could not save — database unavailable.";
      break;
    }

    case "/unlink":
      reply = (await unlinkAdminChat(chatId)) ? t.unlinked : "Could not save — database unavailable.";
      break;

    case "/today":
      reply = admin ? await todayReport() : t.publicHelp;
      break;

    case "/new":
      reply = admin ? await newRegistrations() : t.publicHelp;
      break;

    case "/stats":
      reply = admin ? await stats() : t.publicHelp;
      break;

    default:
      // Anything that isn't a command gets the helpful reply rather than
      // silence — a parent writing "merhaba" should not be ignored.
      reply = command.startsWith("/") ? t.unknown : `${t.greet}\n\n${t.publicHelp}`;
  }

  await sendTelegramMessage(chatId, reply, { disablePreview: true });
  return reply;
}
