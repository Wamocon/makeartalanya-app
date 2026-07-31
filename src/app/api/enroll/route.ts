import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/enroll — book a seat in a class session.
 *
 * Two invariants this route deliberately does NOT maintain by hand:
 *
 *  1. `class_sessions.enrolled_count` is owned by the `trg_enrolled_count`
 *     trigger. This route used to increment it as well, which counted every
 *     booking twice and made classes look full at half capacity.
 *
 *  2. `subscriptions.lessons_used` is owned by the attendance flow
 *     (/api/admin/attendance). This route used to deduct at booking time too,
 *     so a parent who booked and then attended was charged two lessons for one
 *     class. Booking now only *reserves* against the balance; the lesson is
 *     spent when the trainer marks attendance.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session_id, child_id, subscription_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const { data: session, error: sessionErr } = await supabase
      .from("class_sessions")
      .select("id, max_capacity, enrolled_count, status, starts_at")
      .eq("id", session_id)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "cancelled") {
      return NextResponse.json({ error: "This session has been cancelled" }, { status: 400 });
    }

    if (new Date(session.starts_at) < new Date()) {
      return NextResponse.json({ error: "This session has already started" }, { status: 400 });
    }

    if (session.enrolled_count >= session.max_capacity) {
      return NextResponse.json(
        { error: "Session is full", code: "SESSION_FULL" },
        { status: 409 },
      );
    }

    // A child must belong to the requesting parent.
    if (child_id) {
      const { data: child } = await supabase
        .from("children")
        .select("id")
        .eq("id", child_id)
        .eq("parent_id", user.id)
        .maybeSingle();

      if (!child) {
        return NextResponse.json({ error: "Child not found" }, { status: 400 });
      }
    }

    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("session_id", session_id)
      .eq("user_id", user.id)
      .neq("status", "cancelled")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already enrolled in this session" }, { status: 409 });
    }

    // Resolve which subscription pays for this class. An explicit id is
    // validated; otherwise we pick the active subscription expiring soonest so
    // the enrollment is actually linked — without a link, attendance can never
    // deduct anything.
    const subQuery = supabase
      .from("subscriptions")
      .select("id, lessons_total, lessons_used, status")
      .eq("user_id", user.id)
      .eq("status", "active");

    const { data: candidates } = subscription_id
      ? await subQuery.eq("id", subscription_id)
      : await subQuery.order("expires_at", { ascending: true, nullsFirst: false });

    if (subscription_id && (!candidates || candidates.length === 0)) {
      return NextResponse.json(
        { error: "Invalid or inactive subscription" },
        { status: 400 },
      );
    }

    let chosenSubscription: string | null = null;

    if (candidates && candidates.length > 0) {
      // Lessons already reserved by bookings that haven't been attended yet.
      const { data: pending } = await supabase
        .from("enrollments")
        .select("subscription_id")
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .not("subscription_id", "is", null);

      const reserved = new Map<string, number>();
      for (const row of pending ?? []) {
        const id = row.subscription_id as string;
        reserved.set(id, (reserved.get(id) ?? 0) + 1);
      }

      const usable = candidates.find(
        (s) => s.lessons_total - s.lessons_used - (reserved.get(s.id) ?? 0) > 0,
      );

      if (!usable) {
        return NextResponse.json(
          {
            error: "No lessons remaining on your subscription",
            code: "NO_LESSONS_REMAINING",
          },
          { status: 400 },
        );
      }

      chosenSubscription = usable.id;
    }

    const { data: enrollment, error: enrollErr } = await supabase
      .from("enrollments")
      .insert({
        session_id,
        user_id: user.id,
        child_id: child_id || null,
        subscription_id: chosenSubscription,
        status: "confirmed",
        booked_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (enrollErr) {
      // Two bookings racing for the last seat: the trigger pushes enrolled_count
      // past max_capacity and the capacity_not_exceeded CHECK rejects the loser.
      if (enrollErr.message.includes("capacity_not_exceeded")) {
        return NextResponse.json(
          { error: "Session is full", code: "SESSION_FULL" },
          { status: 409 },
        );
      }
      if (enrollErr.code === "23505") {
        return NextResponse.json({ error: "Already enrolled in this session" }, { status: 409 });
      }
      return NextResponse.json({ error: enrollErr.message }, { status: 500 });
    }

    // enrolled_count is maintained by trg_enrolled_count — do not touch it here.

    return NextResponse.json({
      success: true,
      enrollment_id: enrollment.id,
      subscription_id: chosenSubscription,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
