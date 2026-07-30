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
function customEndpoint() {
  const baseURL = process.env.AI_API_URL?.trim();
  if (!baseURL) return null;
  return createOpenAICompatible({
    name: "sokrates",
    baseURL, // e.g. https://sokrates.…/api  → appends /chat/completions
    apiKey: process.env.AI_API_KEY?.trim() || "",
  });
}

export function resolveModel() {
  const custom = customEndpoint();
  if (custom) {
    const model =
      process.env.AI_MODEL_CHAT?.trim() ||
      process.env.AI_MODEL_FAST?.trim() ||
      process.env.AI_MODEL?.trim() ||
      "sokrates-fast";
    return custom.chatModel(model);
  }

  if ((process.env.AI_PROVIDER ?? "").toLowerCase() === "openai") {
    return openai(process.env.AI_MODEL?.trim() || "gpt-4o-mini");
  }
  return anthropic(process.env.AI_MODEL?.trim() || "claude-haiku-4-5-20251001");
}

/** Whether the selected provider has enough config to answer. */
export function providerConfigured(): boolean {
  if (process.env.AI_API_URL?.trim()) return true;
  if ((process.env.AI_PROVIDER ?? "").toLowerCase() === "openai") {
    return Boolean(process.env.OPENAI_API_KEY);
  }
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
