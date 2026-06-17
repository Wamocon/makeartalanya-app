import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load rooms the current user participates in with their last read timestamp.
  const { data: participants, error: participantError } = await supabase
    .from("chat_participants")
    .select("room_id, last_read_at")
    .eq("user_id", user.id);

  if (participantError) {
    console.error("[chat/unread] participants:", participantError.message);
    return NextResponse.json({ error: "Failed to load unread count" }, { status: 500 });
  }

  const roomIds = participants?.map((p) => p.room_id) ?? [];
  if (roomIds.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  // Load all messages sent by others in those rooms.
  const { data: messages, error: messageError } = await supabase
    .from("chat_messages")
    .select("room_id, sender_id, created_at")
    .in("room_id", roomIds)
    .neq("sender_id", user.id);

  if (messageError) {
    console.error("[chat/unread] messages:", messageError.message);
    return NextResponse.json({ error: "Failed to load unread count" }, { status: 500 });
  }

  const lastReadMap = new Map(participants.map((p) => [p.room_id, p.last_read_at]));
  let count = 0;
  for (const message of messages ?? []) {
    const lastRead = lastReadMap.get(message.room_id);
    if (!lastRead || new Date(message.created_at) > new Date(lastRead)) {
      count++;
    }
  }

  return NextResponse.json({ count });
}
