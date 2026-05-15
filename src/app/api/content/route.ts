import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// GET — load content overrides for a locale
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "tr";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 500 });
  }

  const supabase = getClient();
  const { data } = await supabase.storage
    .from("content")
    .download(`${locale}.json`);

  if (!data) {
    return NextResponse.json({ ok: true, content: null });
  }

  const text = await data.text();
  try {
    return NextResponse.json({ ok: true, content: JSON.parse(text) });
  } catch {
    return NextResponse.json({ ok: true, content: null });
  }
}

// POST — save content overrides for a locale
export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 500 });
  }

  const { locale, content } = await req.json();
  if (!locale || !content) {
    return NextResponse.json({ ok: false, error: "locale and content required" }, { status: 400 });
  }

  const supabase = getClient();
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });

  const { error } = await supabase.storage
    .from("content")
    .upload(`${locale}.json`, blob, { upsert: true, contentType: "application/json" });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
