import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Check session exists and has capacity
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
      return NextResponse.json({ error: "Session is full" }, { status: 400 });
    }

    // Check if user already enrolled in this session
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

    // If subscription_id provided, verify and deduct
    if (subscription_id) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, lessons_total, lessons_used, status")
        .eq("id", subscription_id)
        .eq("user_id", user.id)
        .single();

      if (!sub || sub.status !== "active") {
        return NextResponse.json({ error: "Invalid or inactive subscription" }, { status: 400 });
      }

      if (sub.lessons_used >= sub.lessons_total) {
        return NextResponse.json({ error: "No lessons remaining on this subscription" }, { status: 400 });
      }

      // Increment lessons_used
      await supabase
        .from("subscriptions")
        .update({ lessons_used: sub.lessons_used + 1 })
        .eq("id", subscription_id);
    }

    // Create enrollment
    const { data: enrollment, error: enrollErr } = await supabase
      .from("enrollments")
      .insert({
        session_id,
        user_id: user.id,
        child_id: child_id || null,
        subscription_id: subscription_id || null,
        status: "confirmed",
        booked_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (enrollErr) {
      return NextResponse.json({ error: enrollErr.message }, { status: 500 });
    }

    // Increment enrolled_count on class_session
    await supabase
      .from("class_sessions")
      .update({ enrolled_count: session.enrolled_count + 1 })
      .eq("id", session_id);

    return NextResponse.json({ success: true, enrollment_id: enrollment.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
