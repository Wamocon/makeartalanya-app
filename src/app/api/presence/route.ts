import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ONLINE_THRESHOLD_MINUTES = 2;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await request.json().catch(() => ({ path: "" }));
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service client not configured" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("admin_presence")
    .upsert(
      {
        user_id: user.id,
        is_online: true,
        last_seen: now,
        path: typeof path === "string" ? path : null,
        updated_at: now,
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[presence POST]", error.message);
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threshold = new Date(Date.now() - ONLINE_THRESHOLD_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("admin_presence")
    .select("user_id, is_online, last_seen, path, profiles:user_id(full_name, avatar_url)")
    .eq("is_online", true)
    .gte("last_seen", threshold)
    .order("last_seen", { ascending: false });

  if (error) {
    console.error("[presence GET]", error.message);
    return NextResponse.json({ error: "Failed to load presence" }, { status: 500 });
  }

  return NextResponse.json({ admins: data ?? [] });
}
