import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("studio_settings")
      .select("key, value");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert array of {key, value} to a flat object
    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { error } = await supabase
      .from("studio_settings")
      .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
