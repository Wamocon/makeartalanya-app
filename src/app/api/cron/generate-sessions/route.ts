import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/generate-sessions
 *
 * Materialises concrete `class_sessions` rows from the recurring
 * `schedule_templates`. Without this, /schedule can only render read-only
 * template cards and nobody can book anything.
 *
 * Scheduled by vercel.json. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
 * The route is idempotent — `generate_sessions` skips dates that already have a
 * session (unique index idx_no_duplicate_session), so re-running is harmless.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (provided.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 },
    );
  }

  // How far ahead to materialise. Studio-configurable, defaults to 4 weeks so a
  // weekly cron always has headroom if one run is missed.
  const { data: setting } = await admin
    .from("studio_settings")
    .select("value")
    .eq("key", "session_generation_weeks_ahead")
    .maybeSingle();

  const parsed = Number(setting?.value);
  const weeksAhead = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 12) : 4;

  const { data, error } = await admin.rpc("generate_sessions", {
    weeks_ahead: weeksAhead,
  });

  if (error) {
    console.error("[cron/generate-sessions]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    weeks_ahead: weeksAhead,
    sessions_created: data ?? 0,
    ran_at: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  return run(request);
}

// Allows manual triggering with the same bearer token.
export async function POST(request: Request) {
  return run(request);
}
