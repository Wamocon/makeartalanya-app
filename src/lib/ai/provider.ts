import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

/**
 * Provider-agnostic model resolver for the studio concierge.
 *
 * Priority:
 *  1. Self-hosted / custom OpenAI-compatible endpoint (Sokrates on the in-house
 *     NVIDIA DGX). Set AI_API_URL (+ AI_API_KEY). Model comes from
 *     AI_MODEL_CHAT | AI_MODEL_FAST | AI_MODEL.
 *  2. OpenAI    — AI_PROVIDER=openai + OPENAI_API_KEY
 *  3. Anthropic — ANTHROPIC_API_KEY (default)
 */
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function provider(): string {
  return (process.env.AI_PROVIDER ?? "").trim().toLowerCase();
}

export function providerDisplayName(): string {
  const selected = provider();
  if (selected === "openrouter") return "OpenRouter";
  if (selected === "openai") return "OpenAI";
  if (selected === "anthropic") return "Anthropic";
  return usesExternalProvider() ? "the configured overseas AI provider" : "Make Art Studio AI";
}

/**
 * The base URL we will actually call. AI_API_URL wins; otherwise
 * AI_PROVIDER=openrouter implies OpenRouter's endpoint, so the key alone is
 * enough to configure it.
 */
export function resolvedBaseUrl(): string | null {
  const explicit = process.env.AI_API_URL?.trim();
  if (explicit) return explicit;
  if (provider() === "openrouter") return OPENROUTER_BASE_URL;
  return null;
}

function customEndpoint() {
  const baseURL = resolvedBaseUrl();
  if (!baseURL) return null;
  return createOpenAICompatible({
    name: provider() === "openrouter" ? "openrouter" : "sokrates",
    baseURL, // appends /chat/completions
    apiKey: process.env.AI_API_KEY?.trim() || "",
  });
}

export function resolveModel() {
  const custom = customEndpoint();
  if (custom) {
    const fallback =
      provider() === "openrouter" ? "openai/gpt-4o-mini" : "sokrates-fast";
    const model =
      process.env.AI_MODEL_CHAT?.trim() ||
      process.env.AI_MODEL_FAST?.trim() ||
      process.env.AI_MODEL?.trim() ||
      fallback;
    return custom.chatModel(model);
  }

  if (provider() === "openai") {
    return openai(process.env.AI_MODEL?.trim() || "gpt-4o-mini");
  }
  return anthropic(process.env.AI_MODEL?.trim() || "claude-haiku-4-5-20251001");
}

/** Whether the selected provider has enough config to answer. */
export function providerConfigured(): boolean {
  if (resolvedBaseUrl()) return Boolean(process.env.AI_API_KEY?.trim());
  if (provider() === "openai") return Boolean(process.env.OPENAI_API_KEY);
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Hosts that forward prompts to model providers we do not control. Pointing
 * AI_API_URL at one of these is not the same as self-hosting, even though both
 * take the same OpenAI-compatible shape.
 */
const EXTERNAL_AI_HOSTS = [
  "openrouter.ai",
  "api.openai.com",
  "api.anthropic.com",
  "generativelanguage.googleapis.com",
  "api.groq.com",
  "api.together.xyz",
  "api.mistral.ai",
];

/** True when the configured endpoint sends prompts out to a third party. */
export function usesExternalProvider(): boolean {
  const base = resolvedBaseUrl();
  if (!base) return true; // no endpoint set → falls through to OpenAI/Anthropic
  try {
    const host = new URL(base).hostname.toLowerCase();
    return EXTERNAL_AI_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return true; // unparseable URL — assume the worst
  }
}

/**
 * Whether the concierge may be served to visitors at all.
 *
 * Visitors are parents, and they type their children's allergies and diagnoses
 * into chat windows without being asked — special-category data about a minor
 * (KVKK Art. 6) crossing a border (Art. 9) with no legal basis. A prompt
 * instruction is not a control, so the gate sits here.
 *
 * Note that OpenRouter is a router, not a self-hosted endpoint: it relays the
 * prompt onward to whichever provider serves the chosen model. Configuring it
 * therefore counts as an external provider, not as the in-house DGX, even
 * though both are reached through an OpenAI-compatible URL.
 *
 * CONCIERGE_ALLOW_EXTERNAL_PROVIDER=true is the deliberate override for when
 * the transfer has been assessed, documented and named in the aydınlatma metni.
 */
export function conciergeEnabled(): boolean {
  if (!providerConfigured()) return false;
  // Local development still presents the provider-specific consent screen and
  // server-side message checks. Keeping the launcher available here prevents a
  // missing production compliance switch from making the feature impossible
  // to design, test or demonstrate locally.
  if (process.env.NODE_ENV !== "production") return true;
  if (!usesExternalProvider()) return true;
  return process.env.CONCIERGE_ALLOW_EXTERNAL_PROVIDER === "true";
}
