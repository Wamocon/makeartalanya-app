import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createRoomSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().max(100).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine if admin/trainer
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isStaff = profile?.role === "admin" || profile?.role === "trainer";

  let query = supabase
    .from("chat_participants")
    .select(
      `
      room_id,
      role,
      last_read_at,
      chat_rooms!inner(id, type, title, metadata, created_at),
      profiles!inner(id, full_name, avatar_url, role)
    `
    )
    .order("created_at", { referencedTable: "chat_rooms", ascending: false });

  if (!isStaff) {
    query = query.eq("user_id", user.id);
  }

  const { data: participants, error } = await query;

  if (error) {
    console.error("[chat/rooms GET]", error.message);
    return NextResponse.json({ error: "Failed to load rooms" }, { status: 500 });
  }

  // Group by room to return clean room objects with participants
  const roomMap = new Map<string, {
    id: string;
    type: string;
    title: string | null;
    metadata: unknown;
    created_at: string;
    myRole: string;
    last_read_at: string | null;
    participants: { id: string; full_name: string | null; avatar_url: string | null; role: string }[];
  }>();

  for (const p of participants ?? []) {
    const room = (p as unknown as Record<string, unknown>).chat_rooms as Record<string, unknown> | null;
    const participantProfile = (p as unknown as Record<string, unknown>).profiles as Record<string, unknown> | null;
    if (!room) continue;

    const roomId = room.id as string;
    if (!roomMap.has(roomId)) {
      roomMap.set(roomId, {
        id: roomId,
        type: room.type as string,
        title: (room.title as string | null) ?? null,
        metadata: room.metadata,
        created_at: room.created_at as string,
        myRole: p.role as string,
        last_read_at: p.last_read_at as string | null,
        participants: [],
      });
    }

    if (participantProfile) {
      roomMap.get(roomId)!.participants.push({
        id: participantProfile.id as string,
        full_name: participantProfile.full_name as string | null,
        avatar_url: participantProfile.avatar_url as string | null,
        role: participantProfile.role as string,
      });
    }
  }

  // Fetch latest message per room
  const roomIds = Array.from(roomMap.keys());
  const lastMessages: Record<string, { content: string; created_at: string; sender_id: string }> = {};
  if (roomIds.length > 0) {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("room_id, content, created_at, sender_id")
      .in("room_id", roomIds)
      .order("created_at", { ascending: false });

    for (const m of messages ?? []) {
      if (!lastMessages[m.room_id]) {
        lastMessages[m.room_id] = m;
      }
    }
  }

  const rooms = Array.from(roomMap.values()).map((r) => ({
    ...r,
    last_message: lastMessages[r.id] ?? null,
  }));

  return NextResponse.json({ rooms });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { userId, title } = parsed.data;
  const isSelf = userId === user.id;

  // Staff can create rooms for anyone; users can only create their own support room
  if (!isSelf) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin" && profile?.role !== "trainer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service client not configured" }, { status: 500 });
  }

  const { data, error } = await admin.rpc("ensure_support_room", {
    target_user_id: userId,
  });

  if (error || !data) {
    console.error("[chat/rooms POST] ensure_support_room:", error?.message);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }

  // Update title if provided
  if (title) {
    await admin.from("chat_rooms").update({ title }).eq("id", data);
  }

  return NextResponse.json({ roomId: data });
}
