import { knowledge } from "./knowledge";
import type { Locale } from "@/i18n/translations";

type Trilingual = { tr: string; en: string; ru: string };
interface KnowledgeFile {
  systemPrompt: Trilingual;
  guardrails: string[];
  knowledge: Array<{ topic: string } & Trilingual>;
}

const kb = knowledge as KnowledgeFile;

/** Assemble the full, guardrailed system prompt for the concierge in a locale. */
export function buildSystemPrompt(locale: Locale): string {
  const persona = kb.systemPrompt[locale] ?? kb.systemPrompt.en;
  const guardrails = kb.guardrails.map((g, i) => `${i + 1}. ${g}`).join("\n");
  const facts = kb.knowledge
    .map((k) => `### ${k.topic}\n${k[locale] ?? k.en}`)
    .join("\n\n");

  return [
    persona,
    `# LANGUAGE, HIGHEST PRIORITY\nAlways detect the language of the user's most recent message and reply in that exact same language, matching it naturally. This holds for ANY language (Turkish, Russian, English, German, and any other), even when it differs from the website's current language or from the language of these instructions. If the user switches languages mid-conversation, switch with them on the very next reply. Never answer in a different language from the one the user just wrote in.`,
    `# NON-NEGOTIABLE GUARDRAILS\n${guardrails}`,
    `# KNOWLEDGE BASE, grounding only; never invent specifics beyond this\n${facts}`,
    `# STYLE\nKeep answers warm, friendly and concise (2-4 short sentences) unless more detail is requested. You are speaking mostly with parents about their children, so be reassuring and clear. Suggest a natural next step (a free trial lesson, filling in the registration form, or a WhatsApp message) when it fits. Reply in plain, warm conversational prose in short paragraphs, never use markdown formatting (no **bold**, headings, or bulleted/numbered lists). Never use em-dashes or en-dashes (the characters "—" or "–"); use commas, or rephrase instead. Never output code. Never present unconfirmed schedule times, availability or a child's suitability as fact; route those to the studio via WhatsApp or the registration form.`,
  ].join("\n\n");
}
