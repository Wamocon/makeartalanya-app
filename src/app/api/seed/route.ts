import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * POST /api/seed
 * Creates test users for development. Only works when SUPABASE_SERVICE_ROLE_KEY is set.
 * Safe to call multiple times — skips existing users.
 */
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 500 });
  }

  const results: { email: string; status: string }[] = [];

  // Test Admin user
  const adminEmail = "admin@makeart.studio";
  const adminPassword = "Admin123!";
  const { data: existingAdmin } = await supabase.auth.admin.listUsers();
  const adminExists = existingAdmin?.users?.some((u) => u.email === adminEmail);

  if (!adminExists) {
    const { error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: "admin", full_name: "Admin User", preferred_language: "en" },
    });
    results.push({ email: adminEmail, status: error ? `error: ${error.message}` : "created" });

    // Also create profile row
    if (!error) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const adminUser = userData?.users?.find((u) => u.email === adminEmail);
      if (adminUser) {
        await supabase.from("profiles").upsert({
          id: adminUser.id,
          full_name: "Admin User",
          role: "admin",
          preferred_language: "en",
        });
      }
    }
  } else {
    results.push({ email: adminEmail, status: "already exists" });
  }

  // Test Regular user
  const userEmail = "user@makeart.studio";
  const userPassword = "User1234";
  const userExists = existingAdmin?.users?.some((u) => u.email === userEmail);

  if (!userExists) {
    const { error } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: { role: "user", full_name: "Test Parent", preferred_language: "en" },
    });
    results.push({ email: userEmail, status: error ? `error: ${error.message}` : "created" });

    if (!error) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const regularUser = userData?.users?.find((u) => u.email === userEmail);
      if (regularUser) {
        await supabase.from("profiles").upsert({
          id: regularUser.id,
          full_name: "Test Parent",
          role: "user",
          preferred_language: "en",
        });
      }
    }
  } else {
    results.push({ email: userEmail, status: "already exists" });
  }

  return NextResponse.json({
    message: "Seed complete",
    credentials: {
      admin: { email: adminEmail, password: adminPassword, role: "admin" },
      user: { email: userEmail, password: userPassword, role: "user" },
    },
    results,
  });
}
