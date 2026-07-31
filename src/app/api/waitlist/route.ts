import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Waitlist for full sessions.
 *
 * The table, the auto-position trigger and the promotion trigger all shipped in
 * 0005, but nothing ever called them: /schedule rendered a "Waitlist" button
 * that POSTed to /api/enroll and came back "Session is full". This is the
 * missing half.
 *
 * Lifecycle:
 *   POST   → join            (status 'waiting', position assigned by trigger)
 *   PATCH  → accept an offer (status 'offered' → 'confirmed' + enrollment)
 *   DELETE → leave           (status 'cancelled')
 *
 * When a confirmed enrollment is cancelled, trg_promote_waitlist moves the first
 * person in the queue to 'offered', stamps expires_at, and writes a
 * 'waitlist_available' notification.
 */

/** Join the waitlist for a full session. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { session_id?: string; child_id?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { session_id, child_id } = body;
  if (!session_id) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, status, starts_at, enrolled_count, max_capacity")
    .eq("id", session_id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status === "cancelled") {
    return NextResponse.json({ error: "This session has been cancelled" }, { status: 400 });
  }
  if (new Date(session.starts_at) < new Date()) {
    return NextResponse.json({ error: "This session has already started" }, { status: 400 });
  }
  if (session.enrolled_count < session.max_capacity) {
    return NextResponse.json(
      { error: "This session still has space — book it directly", code: "NOT_FULL" },
      { status: 400 },
    );
  }

  if (child_id) {
    const { data: child } = await supabase
      .from("children")
      .select("id")
      .eq("id", child_id)
      .eq("parent_id", user.id)
      .maybeSingle();
    if (!child) return NextResponse.json({ error: "Child not found" }, { status: 400 });
  }

  // Already enrolled? Then there is nothing to wait for.
  const { data: enrolled } = await supabase
    .from("enrollments")
    .select("id")
    .eq("session_id", session_id)
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .maybeSingle();

  if (enrolled) {
    return NextResponse.json({ error: "You are already booked for this class" }, { status: 409 });
  }

  const { data: existing } = await supabase
    .from("waitlist")
    .select("id, status, position")
    .eq("session_id", session_id)
    .eq("user_id", user.id)
    .in("status", ["waiting", "offered"])
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You are already on the waitlist", position: existing.position },
      { status: 409 },
    );
  }

  const { data: entry, error } = await supabase
    .from("waitlist")
    .insert({
      session_id,
      user_id: user.id,
      child_id: child_id || null,
      status: "waiting",
    })
    .select("id, position")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    waitlist_id: entry.id,
    position: entry.position,
  });
}

/** Accept an offered spot: converts the offer into a real enrollment. */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { waitlist_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { waitlist_id } = body;
  if (!waitlist_id) {
    return NextResponse.json({ error: "waitlist_id is required" }, { status: 400 });
  }

  const { data: entry } = await supabase
    .from("waitlist")
    .select("id, session_id, child_id, status, expires_at, user_id")
    .eq("id", waitlist_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!entry) {
    return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
  }
  if (entry.status !== "offered") {
    return NextResponse.json(
      { error: "No spot has been offered for this class yet" },
      { status: 400 },
    );
  }
  if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
    await supabase.from("waitlist").update({ status: "expired" }).eq("id", entry.id);
    return NextResponse.json({ error: "This offer has expired" }, { status: 410 });
  }

  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, status, starts_at, enrolled_count, max_capacity")
    .eq("id", entry.session_id)
    .single();

  if (!session || session.status === "cancelled") {
    return NextResponse.json({ error: "This session is no longer available" }, { status: 400 });
  }
  if (new Date(session.starts_at) < new Date()) {
    return NextResponse.json({ error: "This session has already started" }, { status: 400 });
  }
  if (session.enrolled_count >= session.max_capacity) {
    return NextResponse.json({ error: "The spot was taken already" }, { status: 409 });
  }

  // Attach an active subscription if the parent has one with balance to spare,
  // mirroring /api/enroll. The lesson is spent at attendance, not here.
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, lessons_total, lessons_used")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("expires_at", { ascending: true, nullsFirst: false });

  let subscriptionId: string | null = null;
  if (subs && subs.length > 0) {
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
    subscriptionId =
      subs.find((s) => s.lessons_total - s.lessons_used - (reserved.get(s.id) ?? 0) > 0)?.id ?? null;
  }

  const { data: enrollment, error: enrollErr } = await supabase
    .from("enrollments")
    .insert({
      session_id: entry.session_id,
      user_id: user.id,
      child_id: entry.child_id,
      subscription_id: subscriptionId,
      status: "confirmed",
      booked_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (enrollErr) {
    if (enrollErr.message.includes("capacity_not_exceeded") || enrollErr.code === "23505") {
      return NextResponse.json({ error: "The spot was taken already" }, { status: 409 });
    }
    return NextResponse.json({ error: enrollErr.message }, { status: 500 });
  }

  await supabase.from("waitlist").update({ status: "confirmed" }).eq("id", entry.id);

  return NextResponse.json({ success: true, enrollment_id: enrollment.id });
}

/** Leave the waitlist. */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const sessionId = url.searchParams.get("session_id");

  if (!id && !sessionId) {
    return NextResponse.json({ error: "id or session_id is required" }, { status: 400 });
  }

  let query = supabase
    .from("waitlist")
    .update({ status: "cancelled" })
    .eq("user_id", user.id)
    .in("status", ["waiting", "offered"]);

  query = id ? query.eq("id", id) : query.eq("session_id", sessionId!);

  const { data, error } = await query.select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
