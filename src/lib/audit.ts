import { createAdminClient } from "@/lib/supabase/admin";

export interface AuditEntryInput {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ip?: string;
}

/**
 * Writes a row to the existing audit_log table.
 * Non-blocking: failures are logged but never thrown so business logic continues.
 */
export async function logAuditEntry(input: AuditEntryInput): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { error } = await admin.from("audit_log").insert({
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    changes: input.changes ?? {},
    ip: input.ip ?? null,
  });

  if (error) {
    console.error("[audit] failed to write entry:", error.message);
  }
}
