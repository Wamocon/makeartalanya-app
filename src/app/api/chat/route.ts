import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { resolveModel, providerConfigured } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { rateLimit } from "@/lib/rate-limit";
import type { Locale } from "@/i18n/translations";

export const maxDuration = 30;

const LOCALES: readonly Locale[] = ["tr", "en", "ru"];

export async function POST(req: Request) {
  // Rate limit: 20 messages per IP per minute.
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(`chat:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) {
    return Response.json(
      { error: "Too many messages. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: { messages?: UIMessage[]; locale?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Keep the context bounded (last 24 turns).
  const messages = (body.messages ?? []).slice(-24);
  const locale: Locale = LOCALES.includes((body.locale ?? "") as Locale)
    ? (body.locale as Locale)
    : "tr";

  if (!providerConfigured()) {
    return Response.json(
      {
        error:
          "The assistant is not configured yet. Add AI_API_URL and AI_API_KEY (the DGX endpoint) to .env.local.",
      },
      { status: 503 },
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
    temperature: 0.4,
    // Don't hang forever if the upstream model stalls.
    abortSignal: AbortSignal.timeout(28_000),
    onError: ({ error }) => {
      console.error("[chat] stream error:", error);
    },
  });

  return result.toUIMessageStreamResponse({
    onError: () => fallback[locale],
  });
}
