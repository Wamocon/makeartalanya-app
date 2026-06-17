import { createAdminClient } from "@/lib/supabase/admin";

export interface CreateNotificationInput {
  userId: string;
  type:
    | "sub_expiring"
    | "sub_expired"
    | "sub_low"
    | "class_reminder"
    | "class_cancelled"
    | "waitlist_available"
    | "booking_confirmed"
    | "payment_recorded"
    | "general"
    | "chat_message"
    | "broadcast";
  title: string;
  body?: string;
  link?: string;
  actionText?: string;
  senderId?: string;
  channel?: "in_app" | "telegram" | "email";
}

/**
 * Creates an in-app notification via the service-role client.
 * Safe to call from Route Handlers, Server Actions, and triggers.
 * Returns the new notification id or null on failure.
 */
export async function createNotification(input: CreateNotificationInput): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) {
    console.warn("[createNotification] service-role client not available");
    return null;
  }

  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      action_text: input.actionText ?? null,
      sender_id: input.senderId ?? null,
      channel: input.channel ?? "in_app",
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createNotification] insert error:", error.message);
    return null;
  }

  return data?.id ?? null;
}

/**
 * Broadcast a notification to every user, or to a filtered audience.
 * For now supports: all users, all admins/trainers, or a single user.
 */
export async function broadcastNotification(
  input: Omit<CreateNotificationInput, "userId"> & {
    audience?: { userIds: string[] } | "all" | "admins" | "clients";
  }
): Promise<{ sent: number; failed: number }> {
  const admin = createAdminClient();
  if (!admin) {
    console.warn("[broadcastNotification] service-role client not available");
    return { sent: 0, failed: 0 };
  }

  let userIds: string[] = [];

  if (input.audience && typeof input.audience === "object" && "userIds" in input.audience) {
    userIds = (input.audience as { userIds: string[] }).userIds;
  } else {
    const audience = input.audience ?? "all";
    let query = admin.from("profiles").select("id");
    if (audience === "admins") {
      query = query.in("role", ["admin", "trainer"]);
    } else if (audience === "clients") {
      query = query.eq("role", "user");
    }
    const { data, error } = await query;
    if (error) {
      console.error("[broadcastNotification] profile fetch error:", error.message);
      return { sent: 0, failed: 0 };
    }
    userIds = (data ?? []).map((p) => p.id);
  }

  const rows = userIds.map((userId) => ({
    user_id: userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
    action_text: input.actionText ?? null,
    sender_id: input.senderId ?? null,
    channel: input.channel ?? "in_app",
    sent_at: new Date().toISOString(),
  }));

  if (rows.length === 0) return { sent: 0, failed: 0 };

  // Supabase supports bulk insert; chunk at 500 to stay safe.
  const CHUNK = 500;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await admin.from("notifications").insert(chunk);
    if (error) {
      console.error("[broadcastNotification] bulk insert error:", error.message);
      failed += chunk.length;
    } else {
      sent += chunk.length;
    }
  }

  return { sent, failed };
}
