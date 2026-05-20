import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end required" }, { status: 400 });
  }

  const { data: sessions, error } = await admin
    .from("class_sessions")
    .select(`
      id, starts_at, ends_at, max_capacity, enrolled_count, status, cancel_reason, notes,
      class_types(id, name_en, color, duration_min, max_capacity)
    `)
    .gte("starts_at", start)
    .lt("starts_at", end)
    .order("starts_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { class_type_id, starts_at, ends_at, max_capacity } = await request.json();

  if (!class_type_id || !starts_at || !ends_at) {
    return NextResponse.json({ error: "class_type_id, starts_at, ends_at required" }, { status: 400 });
  }

  const { data: session, error } = await admin
    .from("class_sessions")
    .insert({
      class_type_id,
      starts_at,
      ends_at,
      max_capacity: max_capacity || 8,
      enrolled_count: 0,
      status: "scheduled",
    })
    .select(`
      id, starts_at, ends_at, max_capacity, enrolled_count, status, cancel_reason, notes,
      class_types(id, name_en, color, duration_min, max_capacity)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { id, action, reason } = await request.json();

  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }

  if (action === "cancel") {
    const { error } = await admin
      .from("class_sessions")
      .update({ status: "cancelled", cancel_reason: reason || null })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
