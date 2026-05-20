import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import { notifyAdminNewBooking, telegramNotifyAdminNewBooking } from "@/lib/notifications";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type BookingPayload = {
  name?: string;
  phone?: string;
  language?: "tr" | "en" | "ru";
  isTrial?: boolean;
};

export async function POST(req: Request) {
  try {
    // Rate limit: 5 bookings per IP per minute
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const { allowed, resetIn } = rateLimit(ip, { maxRequests: 5, windowMs: 60_000 });

    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server setup incomplete. Missing SUPABASE_SERVICE_ROLE_KEY in deployment environment.",
        },
        { status: 500 }
      );
    }

    const payload = (await req.json()) as BookingPayload;

    const guestName = payload.name?.trim() || "";
    const guestPhone = payload.phone?.trim() || "";
    const preferredLanguage = payload.language || "tr";
    const isTrial = payload.isTrial === true;

    if (!guestName || !guestPhone) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase.from("bookings").insert({
      guest_name: guestName,
      guest_phone: guestPhone,
      preferred_language: preferredLanguage,
      status: "pending",
      notes: isTrial ? "TRIAL CLASS REQUEST" : null,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // Fire-and-forget notifications (don't block the response)
    const notificationData = { guestName: guestName, guestPhone: guestPhone, language: preferredLanguage };
    Promise.allSettled([
      notifyAdminNewBooking(notificationData),
      telegramNotifyAdminNewBooking(notificationData),
    ]).catch(() => {/* silently ignore notification failures */});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
