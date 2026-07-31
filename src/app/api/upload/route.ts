import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth-guard";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This route holds the service-role key, so the target bucket must never be
// whatever the caller asks for. Only these two are writable from the admin UI.
const WRITABLE_BUCKETS = ["gallery", "instructor"] as const;

// Names we generate below: "<epoch>-<base36>.<ext>". Anything with a slash or a
// dot-segment is rejected so a caller cannot reach outside the bucket root.
const SAFE_FILENAME = /^[A-Za-z0-9._-]+$/;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: "Server not configured." }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) || "gallery";

  if (!WRITABLE_BUCKETS.includes(bucket as (typeof WRITABLE_BUCKETS)[number])) {
    return NextResponse.json({ ok: false, error: "Unknown bucket." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "Only JPEG, PNG, WebP, GIF allowed." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "File too large. Max 10 MB." }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);

  return NextResponse.json({ ok: true, url: data.publicUrl, filename });
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: "Server not configured." }, { status: 500 });
  }

  const { filename, bucket } = (await req.json()) as { filename: string; bucket: string };

  if (!filename || !bucket) {
    return NextResponse.json({ ok: false, error: "Missing filename or bucket." }, { status: 400 });
  }

  if (!WRITABLE_BUCKETS.includes(bucket as (typeof WRITABLE_BUCKETS)[number])) {
    return NextResponse.json({ ok: false, error: "Unknown bucket." }, { status: 400 });
  }

  if (!SAFE_FILENAME.test(filename)) {
    return NextResponse.json({ ok: false, error: "Invalid filename." }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.storage.from(bucket).remove([filename]);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
