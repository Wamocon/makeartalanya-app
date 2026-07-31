import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { resolveModel, providerConfigured, conciergeEnabled, usesExternalProvider } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import {
  CHAT_MAX_CONTEXT_CHARS,
  CHAT_MAX_MESSAGE_LENGTH,
  CHAT_MAX_MESSAGES,
  containsInstructionAttack,
  containsRestrictedChatData,
  textFromMessageParts,
} from "@/lib/ai/safety";
import { rateLimit } from "@/lib/rate-limit";
import type { Locale } from "@/i18n/translations";

export const maxDuration = 30;

const LOCALES: readonly Locale[] = ["tr", "en", "ru"];
const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

export async function POST(req: Request) {
  // Rate limit: 10 messages per IP per minute.
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const { allowed } = rateLimit(`chat:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!allowed) {
    return Response.json(
      { error: "Too many messages. Please wait a moment." },
      { status: 429, headers: NO_STORE_HEADERS },
    );
  }

  let body: { messages?: unknown; locale?: string; transferConsent?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const locale: Locale = LOCALES.includes((body.locale ?? "") as Locale)
    ? (body.locale as Locale)
    : "tr";

  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > CHAT_MAX_MESSAGES) {
    return Response.json({ error: "Invalid conversation." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  let totalChars = 0;
  const messages: UIMessage[] = [];
  for (const [index, raw] of body.messages.entries()) {
    if (typeof raw !== "object" || raw === null) {
      return Response.json({ error: "Invalid message." }, { status: 400, headers: NO_STORE_HEADERS });
    }
    const role = "role" in raw ? raw.role : null;
    const parts = "parts" in raw ? raw.parts : null;
    if (role !== "user" && role !== "assistant") {
      return Response.json({ error: "Invalid message role." }, { status: 400, headers: NO_STORE_HEADERS });
    }
    const text = textFromMessageParts(parts);
    if (text === null || text.trim().length === 0 || text.length > CHAT_MAX_MESSAGE_LENGTH) {
      return Response.json({ error: "Invalid message content." }, { status: 400, headers: NO_STORE_HEADERS });
    }
    totalChars += text.length;
    messages.push({ id: `message-${index}`, role, parts: [{ type: "text", text }] });
  }

  if (totalChars > CHAT_MAX_CONTEXT_CHARS || messages.at(-1)?.role !== "user") {
    return Response.json({ error: "Conversation limit exceeded." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const latestText = textFromMessageParts(messages.at(-1)?.parts);
  if (!latestText || containsRestrictedChatData(latestText)) {
    return Response.json(
      { error: "Do not send contact details, IDs, links or sensitive data in chat." },
      { status: 422, headers: NO_STORE_HEADERS },
    );
  }

  if (containsInstructionAttack(latestText)) {
    return Response.json(
      { error: "Instruction-changing or prompt-extraction requests are not accepted." },
      { status: 422, headers: NO_STORE_HEADERS },
    );
  }

  if (!providerConfigured()) {
    return Response.json(
      {
        error:
          "The assistant is not configured yet. Add AI_API_URL and AI_API_KEY (the DGX endpoint) to .env.local.",
      },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }

  // The layout hides the widget when the model would run outside Türkiye, but
  // the route stays reachable — so it refuses on the same condition.
  if (!conciergeEnabled()) {
    return Response.json(
      {
        error:
          "The assistant is disabled: no in-house AI_API_URL is set. Point it at the DGX endpoint, or set CONCIERGE_ALLOW_EXTERNAL_PROVIDER=true once the cross-border transfer has been assessed.",
      },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }

  if (usesExternalProvider() && body.transferConsent !== true) {
    return Response.json(
      { error: "Explicit AI transfer consent is required." },
      { status: 403, headers: NO_STORE_HEADERS },
    );
  }

  const fallback: Record<Locale, string> = {
    tr: "Üzgünüz, şu anda asistana ulaşılamadı. Lütfen birazdan tekrar deneyin veya WhatsApp +90 551 674 55 15 numarasına yazın; hemen yardımcı oluruz.",
    en: "Sorry, I couldn't reach the assistant just now. Please try again in a moment, or message us on WhatsApp at +90 551 674 55 15 and we'll help right away.",
    ru: "Извините, сейчас не удалось получить ответ. Попробуйте ещё раз через минуту или напишите нам в WhatsApp +90 551 674 55 15, и мы сразу поможем.",
  };

  const result = streamText({
    model: resolveModel(),
    system: buildSystemPrompt(locale),
    messages: await convertToModelMessages(messages),
    temperature: 0.2,
    maxOutputTokens: 320,
    // Don't hang forever if the upstream model stalls.
    abortSignal: AbortSignal.timeout(28_000),
    onError: ({ error }) => {
      console.error("[chat] stream error:", error);
    },
  });

  return result.toUIMessageStreamResponse({
    headers: NO_STORE_HEADERS,
    onError: () => fallback[locale],
  });
}
