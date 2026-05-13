import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type BookingPayload = {
  name?: string;
  email?: string;
  phone?: string;
  language?: "tr" | "en" | "ru";
  package?: string;
  message?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY)) {
      return NextResponse.json(
        { ok: false, error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const payload = (await req.json()) as BookingPayload;

    const guestName = payload.name?.trim() || "";
    const guestEmail = payload.email?.trim().toLowerCase() || "";
    const guestPhone = payload.phone?.trim() || "";
    const preferredLanguage = payload.language || "tr";
    const selectedPackage = payload.package?.trim() || "";
    const message = payload.message?.trim() || "";

    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (!isValidEmail(guestEmail)) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const finalMessage = selectedPackage
      ? `${message}${message ? "\n\n" : ""}Selected package: ${selectedPackage}`
      : message;

    const { error } = await supabase.from("bookings").insert({
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      preferred_language: preferredLanguage,
      message: finalMessage || null,
      status: "pending",
      user_id: null,
      package_id: null,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
