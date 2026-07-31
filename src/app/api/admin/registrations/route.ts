import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEntry } from "@/lib/audit";

const STATUSES = ["new", "contacted", "enrolled", "archived"] as const;
type Status = (typeof STATUSES)[number];

/** PATCH — move a registration along the pipeline. */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  if (!STATUSES.includes(status as Status)) {
    return NextResponse.json(
      { error: `status must be one of: ${STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const { data, error } = await admin
    .from("registrations")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  logAuditEntry({
    actorId: auth.user.id,
    action: "registration_status_changed",
    entityType: "registration",
    entityId: id,
    changes: { status },
  });

  return NextResponse.json({ success: true, registration: data });
}

/** DELETE — erase a registration outright (KVKK deletion requests). */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await admin.from("registrations").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Deliberately records only the id — writing the erased child's name into the
  // audit log would defeat the point of the deletion.
  logAuditEntry({
    actorId: auth.user.id,
    action: "registration_deleted",
    entityType: "registration",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
