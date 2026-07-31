import { createAdminClient } from "@/lib/supabase/admin";
import { actorId as normaliseActor } from "@/lib/studio-settings";

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
 *
 * Note this used to write a column named `ip`; the schema calls it `ip_address`
 * (inet). Combined with the non-UUID "legacy-admin" actor, every insert failed
 * and was swallowed by the console.error below — the audit trail recorded
 * nothing at all.
 */
export async function logAuditEntry(input: AuditEntryInput): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { error } = await admin.from("audit_log").insert({
    actor_id: normaliseActor(input.actorId),
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    changes: input.changes ?? {},
    // inet rejects an empty string, so send NULL when we have no address.
    ip_address: input.ip?.trim() || null,
  });

  if (error) {
    console.error("[audit] failed to write entry:", error.message);
  }
}
