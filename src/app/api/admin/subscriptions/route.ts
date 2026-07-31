import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { actorId, getSetting } from "@/lib/studio-settings";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { user_id, package_id, notes, child_id } = await request.json();

  if (!user_id || !package_id) {
    return NextResponse.json({ error: "user_id and package_id required" }, { status: 400 });
  }

  // Fetch package to get lessons_count
  const { data: pkg } = await admin
    .from("packages")
    .select("lessons_count")
    .eq("id", package_id)
    .single();

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 month validity

  const { data: subscription, error } = await admin
    .from("subscriptions")
    .insert({
      user_id,
      package_id,
      lessons_total: pkg.lessons_count,
      lessons_used: 0,
      status: "active",
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      subscription_type: "package",
      max_freezes: 2,
      freezes_used: 0,
      notes: notes || null,
      child_id: child_id || null,
    })
    .select(`
      id, user_id, package_id, lessons_total, lessons_used, lessons_remaining,
      status, starts_at, expires_at, subscription_type, freezes_used, max_freezes, notes,
      profiles:user_id(full_name, phone),
      packages:package_id(name, lessons_count),
      children:child_id(full_name)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription });
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

  if (action === "freeze") {
    // Freeze subscription
    const { data: sub } = await admin
      .from("subscriptions")
      .select("id, status, freezes_used, max_freezes")
      .eq("id", id)
      .single();


    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (sub.status !== "active") return NextResponse.json({ error: "Only active subs can be frozen" }, { status: 400 });
    if (sub.freezes_used >= sub.max_freezes) return NextResponse.json({ error: "Max freezes reached" }, { status: 400 });

    // Write the freeze record FIRST. It used to run after the status flip and
    // without an error check, so when the insert failed the subscription was
    // left 'frozen' with no matching record — and unfreeze, which looks the
    // record up, then matched nothing.
    const now = new Date();
    const freezeDays = await getSetting(admin, "max_freeze_days", 30);
    const plannedResume = new Date(now.getTime() + freezeDays * 86_400_000);

    const { error: freezeErr } = await admin.from("subscription_freezes").insert({
      subscription_id: id,
      frozen_at: now.toISOString(),
      // NOT NULL in the schema — omitting it failed every insert.
      planned_resume: plannedResume.toISOString(),
      reason: reason?.trim() || "Admin freeze",
      created_by: actorId(auth.user.id),
    });

    if (freezeErr) {
      return NextResponse.json({ error: freezeErr.message }, { status: 500 });
    }

    const { error: statusErr } = await admin
      .from("subscriptions")
      .update({ status: "frozen", freezes_used: sub.freezes_used + 1 })
      .eq("id", id);

    if (statusErr) {
      // Undo the record so the two never disagree.
      await admin
        .from("subscription_freezes")
        .delete()
        .eq("subscription_id", id)
        .eq("frozen_at", now.toISOString());
      return NextResponse.json({ error: statusErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: "frozen",
      planned_resume: plannedResume.toISOString(),
    });
  }

  if (action === "unfreeze") {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("id, status")
      .eq("id", id)
      .single();

    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (sub.status !== "frozen") return NextResponse.json({ error: "Not frozen" }, { status: 400 });

    await admin
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", id);

    // Update freeze record
    await admin
      .from("subscription_freezes")
      .update({ actual_resume: new Date().toISOString() })
      .eq("subscription_id", id)
      .is("actual_resume", null);

    return NextResponse.json({ success: true, status: "active" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
