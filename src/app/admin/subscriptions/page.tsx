import { createClient } from "@/lib/supabase/server";
import { CreditCard } from "lucide-react";
import SubscriptionsManager from "./SubscriptionsManager";

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  // Fetch all subscriptions with user and package info
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(`
      id, user_id, package_id, lessons_total, lessons_used, lessons_remaining,
      status, starts_at, expires_at, subscription_type, freezes_used, max_freezes, notes,
      profiles:user_id(full_name, phone),
      packages:package_id(name, lessons_count),
      children:child_id(full_name)
    `)
    .order("created_at", { ascending: false });

  // Fetch packages for "create" form
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, lessons_count")
    .order("lessons_count");

  // Fetch clients for assignment (role='user' in schema)
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("role", "user")
    .order("full_name");

  // Normalize joined data (Supabase returns arrays for joins)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedSubs = (subscriptions || []).map((s: any) => ({
    ...s,
    profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles,
    packages: Array.isArray(s.packages) ? s.packages[0] : s.packages,
    children: Array.isArray(s.children) ? s.children[0] : s.children,
  }));

  const active = normalizedSubs.filter((s: { status: string }) => s.status === "active").length;
  const frozen = normalizedSubs.filter((s: { status: string }) => s.status === "frozen").length;
  const expired = normalizedSubs.filter((s: { status: string }) => s.status === "expired").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2327] flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#DCA8B2]" />
          Subscriptions
        </h1>
        <p className="text-sm text-[#9B8A8F] mt-1">Manage client subscriptions and packages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-emerald-600">{active}</p>
          <p className="text-xs text-[#9B8A8F]">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-blue-600">{frozen}</p>
          <p className="text-xs text-[#9B8A8F]">Frozen</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-[#9B8A8F]">{expired}</p>
          <p className="text-xs text-[#9B8A8F]">Expired</p>
        </div>
      </div>

      <SubscriptionsManager
        subscriptions={normalizedSubs}
        packages={packages || []}
        clients={clients || []}
      />
    </div>
  );
}
