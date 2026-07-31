import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth-guard";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// The locale becomes a storage object path below, so it is matched against the
// three languages we ship rather than passed through from the request.
const LOCALES = ["tr", "en", "ru"] as const;
const isLocale = (v: string): v is (typeof LOCALES)[number] =>
  LOCALES.includes(v as (typeof LOCALES)[number]);

// Only the admin content editor talks to this route. The public landing page
// reads the same overrides straight from the public storage URL (page.tsx).
function getClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// GET — load content overrides for a locale
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "tr";

  if (!isLocale(locale)) {
    return NextResponse.json({ ok: false, error: "Unknown locale" }, { status: 400 });
  }

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
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 500 });
  }

  const { locale, content } = await req.json();
  if (!locale || !content) {
    return NextResponse.json({ ok: false, error: "locale and content required" }, { status: 400 });
  }

  if (!isLocale(locale)) {
    return NextResponse.json({ ok: false, error: "Unknown locale" }, { status: 400 });
  }

  // These overrides are merged into the live landing page copy, so only a JSON
  // object is accepted — never an array or a bare scalar.
  if (typeof content !== "object" || Array.isArray(content)) {
    return NextResponse.json({ ok: false, error: "content must be an object" }, { status: 400 });
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
