import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/studio-settings";

/**
 * POST /api/enroll/cancel — a parent cancels their own booking.
 *
 * There was no cancellation path at all: /my/classes listed bookings read-only
 * and `cancellation_policy_hours` was a studio setting nothing enforced.
 *
 * Cancelling matters beyond the one booking — setting the enrollment to
 * 'cancelled' fires trg_promote_waitlist, which offers the freed seat to the
 * first person waiting and notifies them. And because the lesson is only spent
 * at attendance, cancelling in time costs the parent nothing.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { enrollment_id?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { enrollment_id, reason } = body;
  if (!enrollment_id) {
    return NextResponse.json({ error: "enrollment_id is required" }, { status: 400 });
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status, session_id, class_sessions(starts_at, status)")
    .eq("id", enrollment_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (enrollment.status !== "confirmed") {
    return NextResponse.json(
      { error: `This booking is already ${enrollment.status}` },
      { status: 400 },
    );
  }

  const raw = enrollment.class_sessions;
  const session = (Array.isArray(raw) ? raw[0] : raw) as
    | { starts_at: string; status: string }
    | null;

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const startsAt = new Date(session.starts_at);
  const hoursUntil = (startsAt.getTime() - Date.now()) / 3_600_000;

  // A cancelled class is the studio's doing, so the parent may always withdraw
  // from it regardless of the notice period.
  if (session.status !== "cancelled") {
    if (hoursUntil <= 0) {
      return NextResponse.json(
        { error: "This class has already started", code: "ALREADY_STARTED" },
        { status: 400 },
      );
    }

    // studio_settings is world-readable, but read it with the service role when
    // available so a policy change can't silently drop us to the default.
    const settingsClient = createAdminClient() ?? supabase;
    const cutoffHours = await getSetting(settingsClient, "cancellation_policy_hours", 24);

    if (hoursUntil < cutoffHours) {
      return NextResponse.json(
        {
          error: `Bookings must be cancelled at least ${cutoffHours} hours in advance. Please contact the studio.`,
          code: "TOO_LATE",
          cutoff_hours: cutoffHours,
          hours_until: Math.max(0, Math.round(hoursUntil * 10) / 10),
        },
        { status: 400 },
      );
    }
  }

  const { error } = await supabase
    .from("enrollments")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason?.trim() || null,
    })
    .eq("id", enrollment_id)
    // Guard against two cancels racing; the second matches nothing.
    .eq("status", "confirmed");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // enrolled_count is decremented by trg_enrolled_count, and the freed seat is
  // offered to the waitlist by trg_promote_waitlist. Nothing to do by hand.
  return NextResponse.json({ success: true });
}
