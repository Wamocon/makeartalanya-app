import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { registrationSchema } from "@/lib/schemas";
import {
  notifyAdminNewBooking,
  telegramNotifyAdminNewBooking,
  sendRegistrationConfirmation,
} from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { newLinkToken, botUsername } from "@/lib/telegram/parent-link";
import {
  MEDIA_CONSENT_VERSION,
  PRIVACY_NOTICE_VERSION,
  TERMS_VERSION,
} from "@/lib/legal";

const NOTICE_AND_TERMS_COLUMNS = [
  "privacy_notice_ack",
  "privacy_notice_version",
  "terms_ack",
  "terms_version",
  "consent_health",
] as const;

const MEDIA_CONSENT_COLUMNS = [
  "consent_media_website",
  "consent_media_social",
  "media_consent_version",
  "media_consented_at",
  "media_consent_ip",
] as const;

const AUTHORIZED_PICKUP_COLUMNS = ["authorized_pickup"] as const;

const TELEGRAM_LINK_COLUMNS = ["telegram_link_token"] as const;

type RegistrationInsertError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function isMissingRegistrationColumn(
  error: RegistrationInsertError | null,
  columns: readonly string[],
) {
  if (!error || (error.code !== "PGRST204" && error.code !== "42703")) {
    return false;
  }

  const description = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return columns.some((column) => description.includes(column));
}

export async function POST(req: Request) {
  try {
    // Rate limit: 5 registrations per IP per minute.
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const { allowed, resetIn } = rateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } },
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      console.error("Registration API is missing its Supabase server configuration.");
      return NextResponse.json(
        { ok: false, error: "Registration is temporarily unavailable." },
        { status: 500 },
      );
    }

    const json = await req.json();
    const parsed = registrationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please check the form and fill in all required fields.", code: "VALIDATION" },
        { status: 400 },
      );
    }
    const d = parsed.data;

    const mediaConsentGranted = d.consentMediaWebsite || d.consentMediaSocial;
    const consentedAt = new Date().toISOString();

    const legacyRegistration = {
      parent_name: d.parentName.trim(),
      parent_id_no: d.parentIdNo?.trim() || null,
      parent_relationship: d.parentRelationship || null,
      parent_email: d.parentEmail.trim(),
      parent_phone: d.parentPhone.trim(), // WhatsApp
      parent_address: d.parentAddress?.trim() || null,
      child_name: d.childName.trim(),
      child_birth_date: d.childBirthDate,
      child_gender: d.childGender || null,
      child_health_notes: d.childHealthNotes?.trim() || null,
      emergency_contact: d.emergencyContact.trim(),
      branch: d.branch,
      package_id: d.packageId?.trim() || null,
      preferred_language: d.preferredLanguage,
      message: d.message?.trim() || null,
      consent_kvkk: d.privacyNoticeAccepted,
      consent_liability: d.termsAccepted,
      // Compatibility mirror for the current admin UI. Granular channel
      // permissions below remain the source of truth after migration 0020.
      consent_media: mediaConsentGranted,
      consent_version: PRIVACY_NOTICE_VERSION,
      consented_at: consentedAt,
      consent_ip: ip,
      status: "new",
    };

    const noticeAndTermsRegistration = {
      ...legacyRegistration,
      // Keep the legacy consent mirrors above for existing reports while the
      // distinct fields preserve the current notice, terms and health records.
      privacy_notice_ack: d.privacyNoticeAccepted,
      privacy_notice_version: PRIVACY_NOTICE_VERSION,
      terms_ack: d.termsAccepted,
      terms_version: TERMS_VERSION,
      consent_health: d.consentHealth,
    };

    const mediaConsentRegistration = {
      ...noticeAndTermsRegistration,
      consent_media_website: d.consentMediaWebsite,
      consent_media_social: d.consentMediaSocial,
      media_consent_version: MEDIA_CONSENT_VERSION,
      media_consented_at: mediaConsentGranted ? consentedAt : null,
      media_consent_ip: mediaConsentGranted ? ip : null,
    };

    // Single-use token backing the "get updates on Telegram" deep link on the
    // success screen. A bot cannot message someone first, so this token is how
    // the parent's own /start ties their chat back to this row.
    const telegramToken = newLinkToken();

    // Who may collect the child (agreement clause 3.5) — a safeguarding field,
    // so it gets its own fallback layer rather than riding along with the
    // Telegram token, which is a convenience and may be dropped independently.
    const pickupRegistration = {
      ...mediaConsentRegistration,
      authorized_pickup: d.authorizedPickup.trim(),
    };

    const currentRegistration = {
      ...pickupRegistration,
      telegram_link_token: telegramToken,
    };

    // Shape used when only the pickup column is missing: keep the token.
    const mediaConsentWithTelegram = {
      ...mediaConsentRegistration,
      telegram_link_token: telegramToken,
    };

    let { error } = await supabase.from("registrations").insert(currentRegistration);

    // Telegram opt-in is a convenience — never let a missing column (or a
    // lagging PostgREST schema cache) cost the studio an actual registration.
    let telegramLinkAvailable = true;
    if (isMissingRegistrationColumn(error, TELEGRAM_LINK_COLUMNS)) {
      console.warn(
        "Telegram link columns are not available yet; saving without the opt-in token.",
        { code: error?.code },
      );
      telegramLinkAvailable = false;
      ({ error } = await supabase.from("registrations").insert(pickupRegistration));
    }

    // Same story for migration 0022. Losing the pickup list is worse than the
    // Telegram token, so it is logged at error level: the studio needs to ask
    // for it by hand until the migration lands.
    //
    // Keep the Telegram token on this retry when that column does exist —
    // dropping it here would still hand the parent a deep link whose token was
    // never stored, so tapping it could never bind their chat.
    if (isMissingRegistrationColumn(error, AUTHORIZED_PICKUP_COLUMNS)) {
      console.error(
        "authorized_pickup column is missing (migration 0022 not applied); saving without the pickup list.",
        { code: error?.code },
      );
      ({ error } = telegramLinkAvailable
        ? await supabase.from("registrations").insert(mediaConsentWithTelegram)
        : await supabase.from("registrations").insert(mediaConsentRegistration));
    }

    // Deployments can briefly run this form before migration 0020 reaches
    // PostgREST's schema cache. Missing-column failures occur before insertion,
    // so retrying once with the migration-0019 shape is safe.
    if (isMissingRegistrationColumn(error, MEDIA_CONSENT_COLUMNS)) {
      console.warn(
        "Granular media-consent columns are not available yet; retrying with the migration-0019 schema.",
        { code: error?.code },
      );
      ({ error } = await supabase.from("registrations").insert(noticeAndTermsRegistration));
    }

    // Keep compatibility with an environment where migration 0019 is also
    // still pending. The legacy media mirror remains the OR of both choices.
    if (isMissingRegistrationColumn(error, NOTICE_AND_TERMS_COLUMNS)) {
      console.warn(
        "Registration legal columns are not available yet; retrying with the migration-0009 schema.",
        { code: error?.code },
      );
      ({ error } = await supabase.from("registrations").insert(legacyRegistration));
    }

    if (error) {
      console.error("Registration insert error:", error);
      return NextResponse.json(
        { ok: false, error: "Registration could not be saved. Please try again." },
        { status: 500 },
      );
    }

    // Fire-and-forget admin notifications. Deliberately excludes the child's
    // name/PII from the outbound (Telegram/email) message — the admin opens the
    // RLS-protected dashboard for child details. Keeps a minor's data off
    // third-party processors (KVKK).
    const summaryName = `${d.parentName.trim()} (${d.branch})`;
    const notificationData = {
      guestName: summaryName,
      guestPhone: d.parentPhone.trim(),
      language: d.preferredLanguage,
    };
    Promise.allSettled([
      notifyAdminNewBooking(notificationData),
      telegramNotifyAdminNewBooking(notificationData),
      // Confirmation to the parent. Email is a required field, so this always
      // has an address to send to.
      sendRegistrationConfirmation({
        parentEmail: d.parentEmail.trim(),
        parentName: d.parentName.trim(),
        childName: d.childName.trim(),
        branch: d.branch,
        language: d.preferredLanguage,
      }),
    ]).catch(() => {
      /* silently ignore notification failures */
    });

    // Deep link the parent can tap to receive updates. Telegram forbids the bot
    // from writing first, so this button — which makes the parent send
    // "/start <token>" — is the only way to open that channel.
    let telegramLink: string | null = null;
    if (telegramLinkAvailable) {
      const username = await botUsername();
      if (username) {
        telegramLink = `https://t.me/${username}?start=${telegramToken}`;
      }
    }

    return NextResponse.json({ ok: true, telegramLink });
  } catch (err) {
    console.error("Registration API error:", err);
    return NextResponse.json({ ok: false, error: "Unexpected server error." }, { status: 500 });
  }
}
