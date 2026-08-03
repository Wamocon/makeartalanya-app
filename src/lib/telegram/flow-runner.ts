import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/notifications/telegram";
import { registrationSchema } from "@/lib/schemas";
import { createRegistration } from "@/lib/registrations/create";
import { COMPANY } from "@/lib/legal";
import {
  CB,
  STEPS,
  UI,
  advance,
  askFor,
  nextStep,
  stepByKey,
  summary,
  toRegistrationInput,
  type Answers,
  type BotReply,
  type Button,
  type Input,
  type Lang,
} from "./flow";

/**
 * Drives the registration conversation: loads the session, applies one input
 * through the pure state machine in flow.ts, sends the replies and saves the
 * result. All the branching lives in flow.ts; this file only does I/O.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || COMPANY.website;
const WA_DIGITS = COMPANY.phoneHref.replace(/\D/g, "");

/** Control states that are not questions. */
const STATE_LANG = "@lang";
const STATE_MENU = "@menu";
const STATE_REVIEW = "@review";

/** Sessions older than this are treated as abandoned and started afresh. */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

interface Session {
  chatId: number;
  locale: Lang;
  step: string;
  data: Answers;
}

const LANGS: { code: Lang; label: string }[] = [
  { code: "tr", label: "🇹🇷 Türkçe" },
  { code: "en", label: "🇬🇧 English" },
  { code: "ru", label: "🇷🇺 Русский" },
];

const T = <A, B, C>(tr: A, en: B, ru: C) => ({ tr, en, ru });

const COPY = {
  pickLang: "🎨 <b>Make Art Studio Alanya</b>\n\nLütfen dilinizi seçin · Please choose your language · Пожалуйста, выберите язык",
  welcome: T(
    "Hoş geldiniz! 👋 Çocuğunuzu resim, el sanatları veya satranç dersine buradan kaydedebilirsiniz.\n\nSize birkaç soru soracağım. Zorunlu olmayan soruları «Atla» ile geçebilirsiniz. İstediğiniz an /iptal yazabilirsiniz.",
    "Welcome! 👋 You can register your child for painting, crafts or chess right here.\n\nI'll ask you a few questions. You can skip the optional ones with “Skip”, and type /cancel at any time.",
    "Добро пожаловать! 👋 Здесь можно записать ребёнка на рисование, рукоделие или шахматы.\n\nЯ задам несколько вопросов. Необязательные можно пропустить кнопкой «Пропустить», а выйти — командой /cancel.",
  ),
  btnRegister: T("📝 Kayıt ol", "📝 Register", "📝 Записаться"),
  btnSite: T("🌐 Web sitesi", "🌐 Website", "🌐 Сайт"),
  btnSchedule: T("🗓 Ders programı", "🗓 Class schedule", "🗓 Расписание"),
  starting: T(
    "Harika! Başlayalım. 🎨",
    "Great! Let's begin. 🎨",
    "Отлично! Начнём. 🎨",
  ),
  saveFailed: T(
    "Kaydı şu anda kaydedemedim. Lütfen biraz sonra tekrar deneyin veya WhatsApp'tan yazın.",
    "I couldn't save the registration just now. Please try again shortly, or message us on WhatsApp.",
    "Не удалось сохранить заявку. Попробуйте чуть позже или напишите нам в WhatsApp.",
  ),
  validationFailed: T(
    "Bazı bilgiler eksik görünüyor. /start yazarak yeniden başlayabilirsiniz.",
    "Some details look incomplete. Send /start to begin again.",
    "Некоторые данные заполнены не полностью. Отправьте /start, чтобы начать заново.",
  ),
  congratsTitle: T("🎉 <b>Tebrikler, kaydınız alındı!</b>", "🎉 <b>Congratulations, your registration is in!</b>", "🎉 <b>Поздравляем, заявка принята!</b>"),
  congratsBody: T(
    [
      "Kaydınızı aldık ve e-posta adresinize bir onay gönderdik.",
      "",
      "Stüdyo, gün ve saatleri netleştirmek için en kısa sürede WhatsApp'tan sizinle iletişime geçecek. Dilerseniz siz de bize ulaşabilirsiniz:",
    ].join("\n"),
    [
      "We've received it and sent a confirmation to your email.",
      "",
      "The studio will contact you on WhatsApp shortly to agree days and times. You're welcome to reach us first:",
    ].join("\n"),
    [
      "Мы получили заявку и отправили подтверждение на вашу почту.",
      "",
      "Студия скоро свяжется с вами в WhatsApp, чтобы согласовать дни и время. Вы также можете написать нам сами:",
    ].join("\n"),
  ),
  bookMeeting: T("Görüşme ayarlamak için:", "To arrange a meeting:", "Чтобы договориться о встрече:"),
  btnWhatsApp: T("💬 WhatsApp'tan yazın", "💬 Message on WhatsApp", "💬 Написать в WhatsApp"),
  btnEmail: T("✉️ E-posta gönderin", "✉️ Send an email", "✉️ Написать письмо"),
  visitUs: T(
    `📍 ${COMPANY.atelier.join(", ")}\n☎️ ${COMPANY.phone}\n✉️ ${COMPANY.email}`,
    `📍 ${COMPANY.atelier.join(", ")}\n☎️ ${COMPANY.phone}\n✉️ ${COMPANY.email}`,
    `📍 ${COMPANY.atelier.join(", ")}\n☎️ ${COMPANY.phone}\n✉️ ${COMPANY.email}`,
  ),
} as const;

// ── session store ─────────────────────────────────────────────────────────

async function loadSession(chatId: number): Promise<Session | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("telegram_sessions")
    .select("chat_id, locale, step, data, updated_at")
    .eq("chat_id", chatId)
    .maybeSingle();

  if (!data) return null;

  if (Date.now() - new Date(data.updated_at).getTime() > SESSION_TTL_MS) {
    await clearSession(chatId);
    return null;
  }

  return {
    chatId,
    locale: (data.locale as Lang) ?? "en",
    step: data.step as string,
    data: (data.data ?? {}) as Answers,
  };
}

async function saveSession(session: Session): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { error } = await admin.from("telegram_sessions").upsert(
    {
      chat_id: session.chatId,
      locale: session.locale,
      step: session.step,
      data: session.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "chat_id" },
  );

  if (error) console.error("[telegram] could not save session:", error.message);
}

export async function clearSession(chatId: number): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("telegram_sessions").delete().eq("chat_id", chatId);
}

// ── sending ───────────────────────────────────────────────────────────────

function toMarkup(buttons?: Button[][]) {
  if (!buttons?.length) return undefined;
  return {
    inline_keyboard: buttons.map((row) =>
      row.map((b) =>
        "url" in b ? { text: b.label, url: b.url } : { text: b.label, callback_data: b.data },
      ),
    ),
  };
}

async function send(chatId: number, replies: BotReply[]): Promise<void> {
  for (const reply of replies) {
    await sendTelegramMessage(chatId, reply.text, {
      replyMarkup: toMarkup(reply.buttons),
      disablePreview: true,
    });
  }
}

// ── entry points ──────────────────────────────────────────────────────────

/** `/start` with no deep-link payload: offer the three languages. */
export async function startLanguagePick(chatId: number): Promise<void> {
  await saveSession({ chatId, locale: "en", step: STATE_LANG, data: {} });
  await send(chatId, [
    {
      text: COPY.pickLang,
      buttons: LANGS.map((l) => [{ label: l.label, data: CB.lang(l.code) }]),
    },
  ]);
}

async function showMenu(chatId: number, lang: Lang, data: Answers): Promise<void> {
  await saveSession({ chatId, locale: lang, step: STATE_MENU, data });
  await send(chatId, [
    {
      text: COPY.welcome[lang],
      buttons: [
        [{ label: COPY.btnRegister[lang], data: CB.menuRegister }],
        [{ label: COPY.btnSite[lang], url: `${SITE}/kayit` }],
        [{ label: COPY.btnSchedule[lang], url: `${SITE}/schedule` }],
      ],
    },
  ]);
}

async function beginQuestions(chatId: number, lang: Lang): Promise<void> {
  const first = nextStep({});
  if (!first) return;
  await saveSession({ chatId, locale: lang, step: first.key, data: {} });
  await send(chatId, [{ text: COPY.starting[lang] }, askFor(first, lang, {})]);
}

/**
 * True when the chat is mid-conversation, so a plain text message should be
 * treated as an answer rather than falling through to the command handler.
 */
export async function hasActiveFlow(chatId: number): Promise<boolean> {
  const session = await loadSession(chatId);
  return Boolean(session && session.step !== STATE_MENU && session.step !== STATE_LANG);
}

export async function cancelFlow(chatId: number, lang?: Lang): Promise<void> {
  const session = await loadSession(chatId);
  await clearSession(chatId);
  await send(chatId, [{ text: UI.cancelled[lang ?? session?.locale ?? "en"] }]);
}

/** A tapped inline button. Returns false when the payload isn't ours. */
export async function handleCallback(chatId: number, payload: string): Promise<boolean> {
  const session = (await loadSession(chatId)) ?? {
    chatId,
    locale: "en" as Lang,
    step: STATE_LANG,
    data: {},
  };

  if (payload.startsWith("l:")) {
    const code = payload.slice(2) as Lang;
    const lang = LANGS.some((l) => l.code === code) ? code : "en";
    await showMenu(chatId, lang, session.data);
    return true;
  }

  if (payload === CB.menuRegister) {
    await beginQuestions(chatId, session.locale);
    return true;
  }

  if (payload === CB.cancel) {
    await cancelFlow(chatId, session.locale);
    return true;
  }

  if (payload === CB.submit) {
    await submit(chatId, session);
    return true;
  }

  if (payload.startsWith("a:") || payload.startsWith("s:")) {
    const current = stepByKey(session.step);
    if (!current) {
      // The session moved on (or expired) since this keyboard was drawn.
      await showMenu(chatId, session.locale, session.data);
      return true;
    }

    let input: Input;
    if (payload.startsWith("s:")) {
      input = { kind: "skip", step: payload.slice(2) };
    } else {
      const rest = payload.slice(2);
      const sep = rest.indexOf(":");
      input = { kind: "choice", step: rest.slice(0, sep), value: rest.slice(sep + 1) };
    }

    await applyInput(session, input);
    return true;
  }

  return false;
}

/** A typed message while a registration is in progress. */
export async function handleFlowText(chatId: number, text: string): Promise<boolean> {
  const session = await loadSession(chatId);
  if (!session) return false;

  if (session.step === STATE_LANG || session.step === STATE_MENU) return false;

  if (session.step === STATE_REVIEW) {
    await send(chatId, [summary(session.data, session.locale)]);
    return true;
  }

  const current = stepByKey(session.step);
  if (!current) return false;

  await applyInput(session, { kind: "text", text });
  return true;
}

async function applyInput(session: Session, input: Input): Promise<void> {
  const current = stepByKey(session.step);
  if (!current) return;

  const result = advance(current, session.data, input, session.locale);

  const step =
    result.status === "review" ? STATE_REVIEW : result.status === "ask" ? result.step.key : current.key;

  await saveSession({ ...session, step, data: result.answers });
  await send(session.chatId, result.replies);
}

// ── submission ────────────────────────────────────────────────────────────

async function submit(chatId: number, session: Session): Promise<void> {
  const lang = session.locale;
  const payload = toRegistrationInput(session.data, lang);
  const parsed = registrationSchema.safeParse(payload);

  if (!parsed.success) {
    // Should be unreachable: every field was validated as it was answered. If
    // it happens, the flow and the schema have drifted — say so plainly rather
    // than dropping the parent into a dead end.
    console.error(
      "[telegram] collected answers failed schema validation:",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
    await send(chatId, [{ text: COPY.validationFailed[lang] }]);
    await clearSession(chatId);
    return;
  }

  const result = await createRegistration(parsed.data, {
    ip: "telegram",
    source: { kind: "telegram", chatId },
  });

  if (!result.ok) {
    await send(chatId, [{ text: COPY.saveFailed[lang], buttons: contactButtons(lang) }]);
    return;
  }

  await clearSession(chatId);
  await send(chatId, [
    {
      text: [
        COPY.congratsTitle[lang],
        "",
        COPY.congratsBody[lang],
        "",
        COPY.visitUs[lang],
      ].join("\n"),
      buttons: contactButtons(lang),
    },
  ]);
}

function contactButtons(lang: Lang): Button[][] {
  const waText = encodeURIComponent(
    lang === "tr"
      ? "Merhaba! Kaydımı Telegram'dan gönderdim, görüşme ayarlayabilir miyiz?"
      : lang === "ru"
        ? "Здравствуйте! Я отправил(а) заявку через Telegram, можем договориться о встрече?"
        : "Hello! I submitted my registration via Telegram — could we arrange a meeting?",
  );

  return [
    [{ label: COPY.btnWhatsApp[lang], url: `https://wa.me/${WA_DIGITS}?text=${waText}` }],
    [{ label: COPY.btnEmail[lang], url: `mailto:${COMPANY.email}` }],
    [{ label: COPY.btnSchedule[lang], url: `${SITE}/schedule` }],
  ];
}

/** Exposed so the command handler can offer the same menu after /help. */
export async function openMenu(chatId: number, lang: Lang): Promise<void> {
  await showMenu(chatId, lang, {});
}

export const FLOW_STATES = { STATE_LANG, STATE_MENU, STATE_REVIEW, TOTAL_STEPS: STEPS.length };
