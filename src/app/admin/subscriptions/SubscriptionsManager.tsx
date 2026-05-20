"use client";

import { useState } from "react";
import { Plus, Pause, Play, Search } from "lucide-react";

interface Subscription {
  id: string;
  user_id: string;
  package_id: number;
  lessons_total: number;
  lessons_used: number;
  lessons_remaining: number;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  subscription_type: string;
  freezes_used: number;
  max_freezes: number;
  notes: string | null;
  profiles: { full_name: string | null; phone: string | null } | null;
  packages: { name: string; lessons_count: number } | null;
  children: { full_name: string | null } | null;
}

interface Package {
  id: number;
  name: string;
  lessons_count: number;
}

interface Client {
  id: string;
  full_name: string | null;
  phone: string | null;
}

export default function SubscriptionsManager({
  subscriptions: initial,
  packages,
  clients,
}: {
  subscriptions: Subscription[];
  packages: Package[];
  clients: Client[];
}) {
  const [subscriptions, setSubscriptions] = useState(initial);
  const [filter, setFilter] = useState<"all" | "active" | "frozen" | "expired">("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  // Create form state
  const [newSub, setNewSub] = useState({ user_id: "", package_id: "", notes: "" });

  const filtered = subscriptions.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = s.profiles?.full_name || "";
      return name.toLowerCase().includes(q);
    }
    return true;
  });

  async function createSubscription() {
    if (!newSub.user_id || !newSub.package_id) return;
    setLoading("create");
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: newSub.user_id,
          package_id: parseInt(newSub.package_id),
          notes: newSub.notes || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions((prev) => [data.subscription, ...prev]);
        setShowCreate(false);
        setNewSub({ user_id: "", package_id: "", notes: "" });
      }
    } finally {
      setLoading(null);
    }
  }

  async function toggleFreeze(id: string, freeze: boolean) {
    setLoading(id);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: freeze ? "freeze" : "unfreeze" }),
      });
      if (res.ok) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: freeze ? "frozen" : "active", freezes_used: freeze ? s.freezes_used + 1 : s.freezes_used }
              : s
          )
        );
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8A8F]" />
          <input
            type="text"
            placeholder="Search client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "frozen", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                filter === f
                  ? "bg-[#DCA8B2] text-white"
                  : "bg-white border border-[#F0E8EB] text-[#9B8A8F] hover:bg-[#FAFAFA]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-[#2D2327] text-white rounded-xl hover:bg-[#2D2327]/90"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-5 space-y-4">
          <h3 className="font-medium text-[#2D2327]">Create Subscription</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={newSub.user_id}
              onChange={(e) => setNewSub({ ...newSub, user_id: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.phone || c.id.slice(0, 8)}
                </option>
              ))}
            </select>
            <select
              value={newSub.package_id}
              onChange={(e) => setNewSub({ ...newSub, package_id: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            >
              <option value="">Select package...</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.lessons_count} lessons)
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={newSub.notes}
              onChange={(e) => setNewSub({ ...newSub, notes: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            />
          </div>
          <button
            onClick={createSubscription}
            disabled={loading === "create" || !newSub.user_id || !newSub.package_id}
            className="px-4 py-2 text-xs font-medium bg-[#DCA8B2] text-white rounded-lg hover:bg-[#B87A88] disabled:opacity-50"
          >
            {loading === "create" ? "Creating..." : "Create Subscription"}
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((sub) => {
          const progress = sub.lessons_total > 0 ? (sub.lessons_used / sub.lessons_total) * 100 : 0;
          const statusColor = sub.status === "active" ? "emerald" : sub.status === "frozen" ? "blue" : "gray";
          
          // Expiry warning
          const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
          const daysUntilExpiry = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) : null;
          const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 14 && daysUntilExpiry > 0;
          const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

          return (
            <div key={sub.id} className="bg-white rounded-xl border border-[#F0E8EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-[#2D2327] truncate">
                    {sub.profiles?.full_name || "Unknown"}
                  </p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-${statusColor}-50 text-${statusColor}-600 border border-${statusColor}-200`}>
                    {sub.status}
                  </span>
                  {isExpiringSoon && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                      ⚠ Expires in {daysUntilExpiry}d
                    </span>
                  )}
                  {isExpired && sub.status !== "expired" && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9B8A8F] mt-0.5">
                  {sub.packages?.name || "—"} · {sub.lessons_used}/{sub.lessons_total} used
                  {sub.children && ` · Child: ${sub.children.full_name}`}
                  {expiresAt && ` · Expires: ${expiresAt.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`}
                </p>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-[#F0E8EB] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progress >= 90 ? "bg-red-400" : progress >= 70 ? "bg-amber-400" : "bg-[#DCA8B2]"}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {sub.status === "active" && sub.freezes_used < sub.max_freezes && (
                  <button
                    onClick={() => toggleFreeze(sub.id, true)}
                    disabled={loading === sub.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                    title="Freeze subscription"
                  >
                    <Pause className="w-3 h-3" /> Freeze
                  </button>
                )}
                {sub.status === "frozen" && (
                  <button
                    onClick={() => toggleFreeze(sub.id, false)}
                    disabled={loading === sub.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
                    title="Unfreeze subscription"
                  >
                    <Play className="w-3 h-3" /> Unfreeze
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-[#F0E8EB]">
            <p className="text-[#9B8A8F]">No subscriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
