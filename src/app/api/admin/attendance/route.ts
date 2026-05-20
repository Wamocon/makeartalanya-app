import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { enrollment_id, attended } = body;

  if (!enrollment_id || typeof attended !== "boolean") {
    return NextResponse.json({ error: "enrollment_id and attended (boolean) required" }, { status: 400 });
  }

  if (attended) {
    // Mark attendance: set attended_at on enrollment
    const { data: enrollment, error: fetchErr } = await admin
      .from("enrollments")
      .select("id, subscription_id, session_id")
      .eq("id", enrollment_id)
      .single();

    if (fetchErr || !enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Update enrollment
    const { error: updateErr } = await admin
      .from("enrollments")
      .update({ attended_at: now, status: "attended" })
      .eq("id", enrollment_id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Deduct from subscription if exists
    if (enrollment.subscription_id) {
      // Insert attendance record
      await admin.from("attendance").insert({
        booking_id: enrollment_id,
        subscription_id: enrollment.subscription_id,
        attended_at: now,
        lesson_deducted: true,
        deducted_at: now,
      });

      // Increment lessons_used
      const { data: sub } = await admin
        .from("subscriptions")
        .select("lessons_used")
        .eq("id", enrollment.subscription_id)
        .single();

      if (sub) {
        await admin
          .from("subscriptions")
          .update({ lessons_used: sub.lessons_used + 1 })
          .eq("id", enrollment.subscription_id);
      }
    }

    return NextResponse.json({ success: true, attended_at: now });
  } else {
    // Undo attendance: clear attended_at
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("id, subscription_id")
      .eq("id", enrollment_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    await admin
      .from("enrollments")
      .update({ attended_at: null, status: "confirmed" })
      .eq("id", enrollment_id);

    // Reverse subscription deduction if applicable
    if (enrollment.subscription_id) {
      // Remove attendance record
      await admin
        .from("attendance")
        .delete()
        .eq("booking_id", enrollment_id)
        .eq("subscription_id", enrollment.subscription_id);

      // Decrement lessons_used
      const { data: sub } = await admin
        .from("subscriptions")
        .select("lessons_used")
        .eq("id", enrollment.subscription_id)
        .single();

      if (sub && sub.lessons_used > 0) {
        await admin
          .from("subscriptions")
          .update({ lessons_used: sub.lessons_used - 1 })
          .eq("id", enrollment.subscription_id);
      }
    }

    return NextResponse.json({ success: true, attended_at: null });
  }
}
