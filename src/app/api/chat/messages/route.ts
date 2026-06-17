import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";
import { logAuditEntry } from "@/lib/audit";
import { chatMessageSchema } from "@/lib/schemas";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const before = searchParams.get("before");

  if (!roomId) {
    return NextResponse.json({ error: "roomId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify access
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

  let query = supabase
    .from("chat_messages")
    .select("*, profiles:sender_id(full_name, avatar_url, role)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data: messages, error } = await query;

  if (error) {
    console.error("[chat/messages GET]", error.message);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }

  return NextResponse.json({ messages: messages?.reverse() ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { roomId, content } = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isStaff = profile?.role === "admin" || profile?.role === "trainer";

  // Verify membership
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

  const { data: message, error: insertError } = await admin
    .from("chat_messages")
    .insert({ room_id: roomId, sender_id: user.id, content })
    .select("*, profiles:sender_id(full_name, avatar_url, role)")
    .single();

  if (insertError || !message) {
    console.error("[chat/messages POST]", insertError?.message);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  logAuditEntry({
    actorId: user.id,
    action: "chat_message_sent",
    entityType: "chat_room",
    entityId: roomId,
    changes: { messageId: message.id },
  }).catch(() => {});

  // Notify recipients
  const { data: participants } = await admin
    .from("chat_participants")
    .select("user_id, role")
    .eq("room_id", roomId);

  const recipientIds = (participants ?? [])
    .filter((p) => p.user_id !== user.id)
    .map((p) => p.user_id);

  for (const recipientId of recipientIds) {
    const isRecipientStaff = (participants ?? []).find((p) => p.user_id === recipientId)?.role === "admin";
    await createNotification({
      userId: recipientId,
      type: "chat_message",
      title: isStaff ? `Message from Make Art Studio` : `New message from ${profile?.full_name ?? "a client"}`,
      body: content.length > 80 ? `${content.slice(0, 80)}…` : content,
      link: isRecipientStaff ? `/admin/messages?roomId=${roomId}` : `/my/messages?roomId=${roomId}`,
      actionText: "Open chat",
      senderId: user.id,
    });
  }

  return NextResponse.json({ message });
}
