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

    // Deduct from subscription if one is linked.
    //
    // The deduction is owned by the `trg_deduct_lesson` BEFORE INSERT trigger on
    // `attendance`: inserting the row with lesson_deducted = FALSE makes the
    // trigger bump subscriptions.lessons_used atomically. Do NOT also increment
    // here — that was the double-charge. The unique index on booking_id makes a
    // second "mark attended" a no-op rather than a second deduction.
    if (enrollment.subscription_id) {
      const { error: attErr } = await admin.from("attendance").insert({
        booking_id: enrollment_id,
        subscription_id: enrollment.subscription_id,
        attended_at: now,
        lesson_deducted: false,
      });

      // 23505 = already marked attended; the lesson was deducted the first time.
      if (attErr && attErr.code !== "23505") {
        // Roll the enrollment back so the UI doesn't show "attended" for a class
        // that was never actually charged.
        await admin
          .from("enrollments")
          .update({ attended_at: null, status: "confirmed" })
          .eq("id", enrollment_id);

        return NextResponse.json({ error: attErr.message }, { status: 500 });
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

    // Reverse the deduction — but only for rows that were actually deducted.
    // There is no DELETE trigger on `attendance`, so the refund is manual;
    // gating it on the deleted rows keeps an un-marking from refunding a lesson
    // that was never charged.
    if (enrollment.subscription_id) {
      const { data: removed } = await admin
        .from("attendance")
        .delete()
        .eq("booking_id", enrollment_id)
        .eq("subscription_id", enrollment.subscription_id)
        .select("id, lesson_deducted");

      const refunds = (removed ?? []).filter((r) => r.lesson_deducted).length;

      if (refunds > 0) {
        const { data: sub } = await admin
          .from("subscriptions")
          .select("lessons_used")
          .eq("id", enrollment.subscription_id)
          .single();

        if (sub) {
          await admin
            .from("subscriptions")
            .update({ lessons_used: Math.max(0, sub.lessons_used - refunds) })
            .eq("id", enrollment.subscription_id);
        }
      }
    }

    return NextResponse.json({ success: true, attended_at: null });
  }
}
