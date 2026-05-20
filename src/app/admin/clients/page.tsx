import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import ClientsTable from "./ClientsTable";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  // Fetch all client profiles (role='user' in this schema)
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, preferred_language")
    .eq("role", "user")
    .order("full_name");

  // Fetch children counts
  const { data: children } = await supabase
    .from("children")
    .select("id, parent_id, is_active")
    .eq("is_active", true);

  // Fetch active subscriptions
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id, user_id, status")
    .eq("status", "active");

  // Aggregate children and subscriptions per client
  const enrichedClients = (clients || []).map((client) => ({
    ...client,
    children_count: children?.filter((c) => c.parent_id === client.id).length || 0,
    active_subs: subscriptions?.filter((s) => s.user_id === client.id).length || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2327] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#A9C7E5]" />
            Clients
          </h1>
          <p className="text-sm text-[#9B8A8F] mt-1">{enrichedClients.length} registered clients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-[#2D2327]">{enrichedClients.length}</p>
          <p className="text-xs text-[#9B8A8F]">Total Clients</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-[#2D2327]">{children?.length || 0}</p>
          <p className="text-xs text-[#9B8A8F]">Children</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-4">
          <p className="text-2xl font-bold text-[#2D2327]">{subscriptions?.length || 0}</p>
          <p className="text-xs text-[#9B8A8F]">Active Subs</p>
        </div>
      </div>

      <ClientsTable clients={enrichedClients} />
    </div>
  );
}
