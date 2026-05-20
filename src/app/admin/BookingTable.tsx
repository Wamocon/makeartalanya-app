"use client";

import { useState } from "react";

type BookingRow = {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  preferred_language: "tr" | "en" | "ru" | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  message: string | null;
  created_at: string;
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export default function BookingTable({ bookings: initial }: { bookings: BookingRow[] }) {
  const [bookings, setBookings] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setActionId(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: status as BookingRow["status"] } : b))
        );
      }
    } finally {
      setActionId(null);
    }
  }

  async function deleteBooking(id: string) {
    if (!confirm("Delete this booking permanently?")) return;
    setActionId(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      }
    } finally {
      setActionId(null);
    }
  }

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_email?.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_phone?.includes(search) ||
      b.message?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
      {/* Table header with filters */}
      <div className="px-5 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Recent Bookings</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--pink)]/30 focus:border-[var(--pink)] w-48 transition-all placeholder:text-[var(--muted)]"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] bg-white/80 border border-[var(--border)] hover:border-slate-300 px-3 py-2 rounded-xl transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
              {statusFilter !== "all" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pink)]" />
              )}
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--border)] rounded-xl shadow-lg p-2 z-10 min-w-[140px]">
                {["all", "pending", "confirmed", "cancelled", "completed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilter(false); }}
                    className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === s ? "bg-[var(--pink-light)] text-[var(--pink-dark)] font-medium" : "hover:bg-slate-50"
                    }`}
                  >
                    {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-slate-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Guest</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Contact</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Lang</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Note</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-pink-50/30 transition-colors group">
                <td className="px-5 py-4 whitespace-nowrap text-xs text-[var(--muted)]">
                  {formatDate(booking.created_at)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="font-medium text-[var(--foreground)]">{booking.guest_name || "—"}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs text-[var(--foreground)]">{booking.guest_email || "—"}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">{booking.guest_phone || "—"}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                    {booking.preferred_language || "—"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    booking.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    booking.status === "cancelled" ? "bg-red-50 text-red-600 border border-red-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      booking.status === "pending" ? "bg-amber-500" :
                      booking.status === "confirmed" ? "bg-emerald-500" :
                      booking.status === "cancelled" ? "bg-red-500" :
                      "bg-blue-500"
                    }`} />
                    {booking.status}
                  </span>
                </td>
                <td className="px-5 py-4 max-w-[260px]">
                  <p className="text-xs text-[var(--muted)] truncate">{booking.message || "—"}</p>
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {booking.status === "pending" && (
                      <button
                        onClick={() => updateStatus(booking.id, "confirmed")}
                        disabled={actionId === booking.id}
                        className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    )}
                    {(booking.status === "pending" || booking.status === "confirmed") && (
                      <button
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        disabled={actionId === booking.id}
                        className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(booking.id, "completed")}
                        disabled={actionId === booking.id}
                        className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      disabled={actionId === booking.id}
                      className="px-2 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="px-5 py-12 text-center text-[var(--muted)] text-sm" colSpan={7}>
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-[var(--border)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    {search || statusFilter !== "all" ? "No bookings match your search" : "No booking requests yet"}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
