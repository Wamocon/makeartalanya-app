export const CHAT_MAX_MESSAGE_LENGTH = 800;
export const CHAT_MAX_MESSAGES = 16;
export const CHAT_MAX_CONTEXT_CHARS = 8_000;

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_OR_ID = /(?:\+?\d[\s().-]*){7,}/;
const URL = /https?:\/\/|www\./i;
const INSTRUCTION_ATTACK =
  /(?:ignore|forget|override|bypass|disregard).{0,48}(?:instruction|rule|prompt)|(?:reveal|show|print|translate).{0,48}(?:system|developer).{0,24}(?:prompt|message|instruction)|jailbreak|\bDAN\s+mode\b/i;

/**
 * The public concierge does not need identifiers, contact details, documents
 * or pasted remote content. Reject them before any third-party model call.
 */
export function containsRestrictedChatData(value: string): boolean {
  return EMAIL.test(value) || PHONE_OR_ID.test(value) || URL.test(value);
}

/** Reject obvious attempts to replace or extract the studio's instructions. */
export function containsInstructionAttack(value: string): boolean {
  return INSTRUCTION_ATTACK.test(value);
}

export function textFromMessageParts(parts: unknown): string | null {
  if (!Array.isArray(parts) || parts.length === 0 || parts.length > 4) return null;
  let text = "";
  for (const part of parts) {
    if (
      typeof part !== "object" ||
      part === null ||
      !("type" in part) ||
      part.type !== "text" ||
      !("text" in part) ||
      typeof part.text !== "string"
    ) {
      return null;
    }
    text += part.text;
  }
  return text;
}
