"use client";

import { useState } from "react";
import { Plus, Search, Download } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  notes: string | null;
  paid_at: string;
  profiles: { full_name: string | null; phone: string | null } | null;
  subscriptions: { id: string; packages: { name: string } | null } | null;
}

interface Client {
  id: string;
  full_name: string | null;
  phone: string | null;
}

interface Subscription {
  id: string;
  user_id: string;
  packages: { name: string } | null;
  lessons_total: number;
}

export default function PaymentsManager({
  payments: initial,
  clients,
  subscriptions,
}: {
  payments: Payment[];
  clients: Client[];
  subscriptions: Subscription[];
}) {
  const [payments, setPayments] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    user_id: "",
    subscription_id: "",
    amount: "",
    currency: "EUR",
    method: "cash",
    notes: "",
  });

  const filteredSubs = subscriptions.filter((s) => s.user_id === form.user_id);
  const methods = Array.from(new Set(payments.map((p) => p.method)));

  const filtered = payments.filter((p) => {
    if (methodFilter !== "all" && p.method !== methodFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.profiles?.full_name || "").toLowerCase().includes(q);
  });

  async function recordPayment() {
    if (!form.user_id || !form.subscription_id || !form.amount) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: form.user_id,
          subscription_id: form.subscription_id,
          amount: parseFloat(form.amount),
          currency: form.currency,
          method: form.method,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPayments((prev) => [data.payment, ...prev]);
        setShowCreate(false);
        setForm({ user_id: "", subscription_id: "", amount: "", currency: "EUR", method: "cash", notes: "" });
      }
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const headers = ["Date", "Client", "Package", "Amount", "Currency", "Method", "Notes"];
    const rows = filtered.map((p) => [
      new Date(p.paid_at).toLocaleDateString("en"),
      p.profiles?.full_name || "—",
      p.subscriptions?.packages?.name || "—",
      p.amount.toString(),
      p.currency,
      p.method,
      (p.notes || "").replace(/,/g, ";"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white border border-[#F0E8EB] text-[#2D2327] rounded-xl hover:bg-[#F0E8EB]"
          title="Export as CSV"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-[#2D2327] text-white rounded-xl hover:bg-[#2D2327]/90"
        >
          <Plus className="w-3.5 h-3.5" /> Record Payment
        </button>
      </div>

      {/* Method filter pills */}
      {methods.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {["all", ...methods].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                methodFilter === m
                  ? "bg-[#2D2327] text-white border-[#2D2327]"
                  : "bg-white text-[#9B8A8F] border-[#F0E8EB] hover:border-[#DCA8B2]"
              }`}
            >
              {m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-5 space-y-4">
          <h3 className="font-medium text-[#2D2327]">Record Payment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value, subscription_id: "" })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name || c.phone || c.id.slice(0, 8)}</option>
              ))}
            </select>
            <select
              value={form.subscription_id}
              onChange={(e) => setForm({ ...form, subscription_id: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
              disabled={!form.user_id}
            >
              <option value="">Select subscription...</option>
              {filteredSubs.map((s) => (
                <option key={s.id} value={s.id}>{s.packages?.name || "Sub"} ({s.lessons_total} lessons)</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            >
              <option value="EUR">EUR</option>
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
            </select>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
            </select>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="px-3 py-2.5 text-sm border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30"
            />
          </div>
          <button
            onClick={recordPayment}
            disabled={loading || !form.user_id || !form.subscription_id || !form.amount}
            className="px-4 py-2 text-xs font-medium bg-[#DCA8B2] text-white rounded-lg hover:bg-[#B87A88] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Record Payment"}
          </button>
        </div>
      )}

      {/* Payment list */}
      <div className="bg-white rounded-xl border border-[#F0E8EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] border-b border-[#F0E8EB]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Package</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Amount</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Method</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8EB]">
              {filtered.map((payment) => (
                <tr key={payment.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3 font-medium text-[#2D2327]">
                    {payment.profiles?.full_name || "—"}
                  </td>
                  <td className="px-5 py-3 text-[#9B8A8F]">
                    {payment.subscriptions?.packages?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-[#2D2327]">
                    {payment.currency === "EUR" ? "€" : payment.currency === "TRY" ? "₺" : "$"}
                    {Number(payment.amount).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#F0E8EB] text-[#2D2327] capitalize">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#9B8A8F]">
                    {new Date(payment.paid_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#9B8A8F]">
                    No payments recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
