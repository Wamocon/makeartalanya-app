import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { actorId } from "@/lib/studio-settings";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { user_id, subscription_id, amount, currency, method, notes } = await request.json();

  if (!user_id || !subscription_id || !amount) {
    return NextResponse.json({ error: "user_id, subscription_id, and amount required" }, { status: 400 });
  }

  if (amount <= 0) {
    return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
  }

  const validCurrencies = ["EUR", "TRY", "USD"];
  const validMethods = ["cash", "card", "transfer"];

  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      user_id,
      subscription_id,
      amount,
      currency: validCurrencies.includes(currency) ? currency : "EUR",
      method: validMethods.includes(method) ? method : "cash",
      // NULL for the shared cookie login — "legacy-admin" is not a UUID and
      // this column references profiles(id).
      received_by: actorId(auth.user.id),
      notes: notes || null,
      paid_at: new Date().toISOString(),
    })
    .select(`
      id, amount, currency, method, notes, paid_at,
      profiles:user_id(full_name, phone),
      subscriptions:subscription_id(id, packages:package_id(name))
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update subscription paid_at
  await admin
    .from("subscriptions")
    .update({ paid_at: new Date().toISOString() })
    .eq("id", subscription_id);

  return NextResponse.json({ payment });
}
