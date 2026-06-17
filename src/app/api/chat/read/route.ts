import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chatReadSchema } from "@/lib/schemas";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = chatReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { roomId, messageIds } = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isStaff = profile?.role === "admin" || profile?.role === "trainer";

  if (!isStaff) {
    const { count } = await supabase
      .from("chat_participants")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId)
      .eq("user_id", user.id);
    if (!count) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service client not configured" }, { status: 500 });
  }

  const now = new Date().toISOString();

  // Mark messages read
  let query = admin
    .from("chat_messages")
    .update({ read_at: now })
    .eq("room_id", roomId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  if (messageIds && messageIds.length > 0) {
    query = query.in("id", messageIds);
  }

  const { error } = await query;

  if (error) {
    console.error("[chat/read PATCH]", error.message);
    return NextResponse.json({ error: "Failed to mark read" }, { status: 500 });
  }

  // Update participant last_read_at
  await admin
    .from("chat_participants")
    .update({ last_read_at: now })
    .eq("room_id", roomId)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
