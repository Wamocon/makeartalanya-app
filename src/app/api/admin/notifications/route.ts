import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { broadcastNotification, createNotification } from "@/lib/notifications/create";
import { logAuditEntry } from "@/lib/audit";
import { notificationBroadcastSchema } from "@/lib/schemas";
import { actorId } from "@/lib/studio-settings";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const parsed = notificationBroadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { userId, type, title, body: notifBody, link, actionText } = parsed.data;

  try {
    if (userId) {
      // Single user
      const id = await createNotification({
        userId,
        type,
        title,
        body: notifBody,
        link,
        actionText,
        senderId: actorId(auth.user.id) ?? undefined,
      });
      if (!id) {
        return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
      }
      logAuditEntry({
        actorId: auth.user.id,
        action: "notification_sent",
        entityType: "notification",
        entityId: id,
        changes: { userId, type },
      }).catch(() => {});
      return NextResponse.json({ success: true, sent: 1, failed: 0 });
    }

    // Broadcast to all users (default)
    const { sent, failed } = await broadcastNotification({
      type,
      title,
      body: notifBody,
      link,
      actionText,
      senderId: actorId(auth.user.id) ?? undefined,
      audience: "all",
    });

    logAuditEntry({
      actorId: auth.user.id,
      action: "notification_broadcast",
      entityType: "notification",
      entityId: "broadcast",
      changes: { type, sent, failed },
    }).catch(() => {});
    return NextResponse.json({ success: true, sent, failed });
  } catch (err) {
    console.error("[admin/notifications POST]", err);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
