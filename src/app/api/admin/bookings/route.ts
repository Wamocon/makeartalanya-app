import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { notifyBookingStatusChange } from "@/lib/notifications/email";
import { telegramNotifyStatusChange } from "@/lib/notifications/telegram";

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { error } = await supabase
      .from("legacy_bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send notifications on status change (fire-and-forget)
    if (status === "confirmed" || status === "cancelled") {
      const { data: booking } = await supabase
        .from("legacy_bookings")
        .select("guest_name, guest_phone, preferred_language, guest_email, telegram_chat_id")
        .eq("id", id)
        .single();

      if (booking) {
        const notifData = {
          guestName: booking.guest_name,
          guestPhone: booking.guest_phone,
          status,
          language: booking.preferred_language || "en",
          email: booking.guest_email,
        };
        Promise.allSettled([
          notifyBookingStatusChange(notifData),
          booking.telegram_chat_id
            ? telegramNotifyStatusChange(booking.telegram_chat_id, notifData)
            : Promise.resolve(),
        ]).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { error } = await supabase
      .from("legacy_bookings")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
