import { createClient } from "@/lib/supabase/server";
import { Banknote } from "lucide-react";
import PaymentsManager from "./PaymentsManager";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  // Fetch recent payments
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id, amount, currency, method, notes, paid_at,
      profiles:user_id(full_name, phone),
      subscriptions:subscription_id(id, packages:package_id(name))
    `)
    .order("paid_at", { ascending: false })
    .limit(100);

  // Fetch clients and their subscriptions for the "record payment" form
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("role", "user")
    .order("full_name");

  const { data: activeSubscriptions } = await supabase
    .from("subscriptions")
    .select("id, user_id, packages:package_id(name), lessons_total")
    .eq("status", "active");

  // Stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const monthPayments = payments?.filter((p) => new Date(p.paid_at) >= thisMonth) || [];
  const monthTotal = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalAll = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2327] flex items-center gap-2">
          <Banknote className="w-6 h-6 text-[#6BBF7A]" />
          Payments
        </h1>
        <p className="text-sm text-[#9B8A8F] mt-1">Record and view payment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-[#2D2327]">{payments?.length || 0}</p>
          <p className="text-xs text-[#9B8A8F]">Total Payments</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-emerald-600">€{monthTotal.toFixed(0)}</p>
          <p className="text-xs text-[#9B8A8F]">This Month</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-[#2D2327]">€{totalAll.toFixed(0)}</p>
          <p className="text-xs text-[#9B8A8F]">All Time</p>
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PaymentsManager
        payments={(payments || []).map((p: any) => ({
          ...p,
          profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
          subscriptions: Array.isArray(p.subscriptions) ? p.subscriptions[0] : p.subscriptions,
        }))}
        clients={clients || []}
        subscriptions={(activeSubscriptions || []).map((s: any) => ({
          ...s,
          packages: Array.isArray(s.packages) ? s.packages[0] : s.packages,
        }))}
      />
    </div>
  );
}
