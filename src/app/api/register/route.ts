import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { registrationSchema } from "@/lib/schemas";
import { notifyAdminNewBooking, telegramNotifyAdminNewBooking } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";

const CONSENT_VERSION = "2026-07-v1";

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

    const { error } = await supabase.from("registrations").insert({
      parent_name: d.parentName.trim(),
      parent_id_no: d.parentIdNo?.trim() || null,
      parent_relationship: d.parentRelationship || null,
      parent_email: d.parentEmail?.trim() || null,
      parent_phone: d.parentPhone.trim(),
      parent_address: d.parentAddress?.trim() || null,
      child_name: d.childName.trim(),
      child_birth_date: d.childBirthDate || null,
      child_gender: d.childGender || null,
      child_health_notes: d.childHealthNotes?.trim() || null,
      emergency_contact: d.emergencyContact?.trim() || null,
      branch: d.branch,
      package_id: d.packageId?.trim() || null,
      preferred_language: d.preferredLanguage,
      message: d.message?.trim() || null,
      consent_kvkk: d.consentKvkk,
      consent_liability: d.consentLiability,
      consent_media: d.consentMedia ?? false,
      consent_version: CONSENT_VERSION,
      consented_at: new Date().toISOString(),
      consent_ip: ip,
      status: "new",
    });

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
    ]).catch(() => {
      /* silently ignore notification failures */
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Registration API error:", err);
    return NextResponse.json({ ok: false, error: "Unexpected server error." }, { status: 500 });
  }
}
