import { after, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyAdminNewBooking, telegramNotifyAdminNewBooking } from "@/lib/notifications";
import { quickBookingSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from "@/lib/legal";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Rate limit: 5 bookings per IP per minute
    const forwarded = req.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const { allowed, resetIn } = rateLimit(`booking:${ip}`, { maxRequests: 5, windowMs: 60_000 });

    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server setup incomplete. Missing SUPABASE_SERVICE_ROLE_KEY in deployment environment.",
        },
        { status: 500 }
      );
    }

    const parsed = quickBookingSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { error } = await supabase.from("legacy_bookings").insert({
      guest_name: payload.name,
      guest_phone: payload.phone,
      preferred_language: payload.language,
      status: "pending",
      message: payload.isTrial ? "TRIAL CLASS REQUEST" : null,
      consent_kvkk: true,
      privacy_notice_ack: payload.privacyNoticeAccepted,
      privacy_notice_version: PRIVACY_NOTICE_VERSION,
      terms_ack: payload.termsAccepted,
      terms_version: TERMS_VERSION,
      consent_version: PRIVACY_NOTICE_VERSION,
      consented_at: new Date().toISOString(),
      consent_ip: ip,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // Keep the serverless invocation alive until notification attempts settle,
    // without making the visitor wait for SMTP/Telegram delivery.
    const notificationData = {
      guestName: payload.name,
      guestPhone: payload.phone,
      language: payload.language,
    };
    after(async () => {
      const results = await Promise.allSettled([
        notifyAdminNewBooking(notificationData),
        telegramNotifyAdminNewBooking(notificationData),
      ]);
      for (const result of results) {
        if (result.status === "rejected") {
          console.error("[Booking notification] Delivery task failed:", result.reason);
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
