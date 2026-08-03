import "server-only";

import type { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { newLinkToken } from "@/lib/telegram/parent-link";
import type { registrationSchema } from "@/lib/schemas";
import {
  notifyAdminNewBooking,
  telegramNotifyAdminNewBooking,
  sendRegistrationConfirmation,
} from "@/lib/notifications";
import {
  MEDIA_CONSENT_VERSION,
  PRIVACY_NOTICE_VERSION,
  TERMS_VERSION,
} from "@/lib/legal";

/**
 * The one place a registration is written.
 *
 * Both the web form (/api/register) and the Telegram bot land here. When these
 * were two code paths they drifted: a column added for one silently went
 * missing from the other, and consent versions could disagree. One writer means
 * one shape, one set of notifications, one audit trail.
 */

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationSource =
  | { kind: "web" }
  /** The parent is already talking to the bot, so their chat is known up front. */
  | { kind: "telegram"; chatId: number };

export type CreateResult =
  | { ok: true; telegramToken: string | null }
  | { ok: false; error: string };

type InsertError = { code?: string; message?: string; details?: string; hint?: string };

/**
 * Which of our own column names a Postgres/PostgREST "unknown column" error is
 * complaining about.
 *
 * A deploy can briefly run ahead of its migrations, and PostgREST caches the
 * schema besides. Rather than a hand-maintained ladder of fallback shapes, we
 * drop exactly the columns the database says it does not have and retry. A
 * missing optional column must never cost the studio a real registration.
 */
function unknownColumns(error: InsertError | null, candidates: string[]): string[] {
  if (!error || (error.code !== "PGRST204" && error.code !== "42703")) return [];

  const description = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return candidates.filter((column) => description.includes(column));
}

/**
 * `media_consent_ip` is a Postgres `inet` column, so it accepts an address or
 * nothing at all. Placeholders we use elsewhere — "unknown" when there is no
 * x-forwarded-for header, "telegram" for a chat with no IP — are rejected by
 * the type and would fail the whole insert, losing a real registration over an
 * audit field. Anything that is not an address becomes NULL.
 */
function asInet(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) {
    return v.split(".").every((octet) => Number(octet) <= 255) ? v : null;
  }
  // Loose IPv6 check: hex groups and colons only, and at least one colon.
  if (v.includes(":") && /^[0-9a-f:]+$/i.test(v)) return v;

  return null;
}

/** Columns that may legitimately be absent on an older schema. */
const DROPPABLE = [
  "telegram_link_token",
  "telegram_chat_id",
  "telegram_linked_at",
  "authorized_pickup",
  "consent_media_website",
  "consent_media_social",
  "media_consent_version",
  "media_consented_at",
  "media_consent_ip",
  "privacy_notice_ack",
  "privacy_notice_version",
  "terms_ack",
  "terms_version",
  "consent_health",
];

export async function createRegistration(
  d: RegistrationInput,
  opts: { ip: string; source: RegistrationSource },
): Promise<CreateResult> {
  const supabase = createAdminClient();
  if (!supabase) {
    console.error("Registration is missing its Supabase server configuration.");
    return { ok: false, error: "Registration is temporarily unavailable." };
  }

  const mediaConsentGranted = d.consentMediaWebsite || d.consentMediaSocial;
  const consentedAt = new Date().toISOString();

  // A bot cannot message someone first, so the web form hands the parent a
  // deep-link token to redeem. Over Telegram that dance is unnecessary: they are
  // already in the chat, so bind it directly.
  const viaTelegram = opts.source.kind === "telegram";
  const telegramToken = viaTelegram ? null : newLinkToken();

  const row: Record<string, unknown> = {
    parent_name: d.parentName.trim(),
    parent_id_no: d.parentIdNo?.trim() || null,
    parent_relationship: d.parentRelationship,
    parent_email: d.parentEmail.trim(),
    parent_phone: d.parentPhone.trim(), // WhatsApp
    parent_address: d.parentAddress?.trim() || null,

    child_name: d.childName.trim(),
    child_birth_date: d.childBirthDate,
    child_gender: d.childGender,
    child_health_notes: d.childHealthNotes?.trim() || null,
    emergency_contact: d.emergencyContact.trim(),
    authorized_pickup: d.authorizedPickup.trim(),

    branch: d.branch,
    package_id: d.packageId.trim(),
    preferred_language: d.preferredLanguage,
    message: d.message?.trim() || null,

    // Legacy mirrors kept for existing reports; the granular fields below are
    // the source of truth.
    consent_kvkk: d.privacyNoticeAccepted,
    consent_liability: d.termsAccepted,
    consent_media: mediaConsentGranted,
    consent_version: PRIVACY_NOTICE_VERSION,
    consented_at: consentedAt,
    consent_ip: opts.ip,

    privacy_notice_ack: d.privacyNoticeAccepted,
    privacy_notice_version: PRIVACY_NOTICE_VERSION,
    terms_ack: d.termsAccepted,
    terms_version: TERMS_VERSION,
    consent_health: d.consentHealth,

    consent_media_website: d.consentMediaWebsite,
    consent_media_social: d.consentMediaSocial,
    media_consent_version: MEDIA_CONSENT_VERSION,
    media_consented_at: mediaConsentGranted ? consentedAt : null,
    media_consent_ip: mediaConsentGranted ? asInet(opts.ip) : null,

    status: "new",
  };

  if (viaTelegram && opts.source.kind === "telegram") {
    row.telegram_chat_id = String(opts.source.chatId);
    row.telegram_linked_at = consentedAt;
  } else {
    row.telegram_link_token = telegramToken;
  }

  let attempt = row;
  let dropped: string[] = [];

  // Bounded: each pass removes at least one column, and stops as soon as the
  // database stops complaining about unknown ones.
  for (let i = 0; i < DROPPABLE.length + 1; i++) {
    const { error } = await supabase.from("registrations").insert(attempt);
    if (!error) {
      if (dropped.length) {
        console.error(
          `Registration saved without columns the database does not have yet: ${dropped.join(", ")}. Apply the pending migrations.`,
        );
      }
      await fireNotifications(d);
      // A token we could not store must not be handed out — the deep link
      // would look fine and then fail to bind anything.
      const usableToken = dropped.includes("telegram_link_token") ? null : telegramToken;
      return { ok: true, telegramToken: usableToken };
    }

    const missing = unknownColumns(error, DROPPABLE);
    if (!missing.length) {
      console.error("Registration insert error:", error);
      return { ok: false, error: "Registration could not be saved. Please try again." };
    }

    dropped = [...dropped, ...missing];
    attempt = Object.fromEntries(
      Object.entries(attempt).filter(([key]) => !missing.includes(key)),
    );
  }

  return { ok: false, error: "Registration could not be saved. Please try again." };
}

/**
 * Fire-and-forget. Deliberately excludes the child's name and any health note
 * from the outbound studio alert — the admin opens the RLS-protected dashboard
 * for those. Keeps a minor's data off third-party processors (KVKK).
 */
async function fireNotifications(d: RegistrationInput): Promise<void> {
  const notificationData = {
    guestName: `${d.parentName.trim()} (${d.branch})`,
    guestPhone: d.parentPhone.trim(),
    language: d.preferredLanguage,
  };

  void Promise.allSettled([
    notifyAdminNewBooking(notificationData),
    telegramNotifyAdminNewBooking(notificationData),
    sendRegistrationConfirmation({
      parentEmail: d.parentEmail.trim(),
      parentName: d.parentName.trim(),
      childName: d.childName.trim(),
      branch: d.branch,
      language: d.preferredLanguage,
    }),
  ]).catch(() => {
    /* notification failures must never fail the registration */
  });
}
