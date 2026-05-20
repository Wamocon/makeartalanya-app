"use client";

import { useState } from "react";
import { Search, Baby, CreditCard } from "lucide-react";

interface Client {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  preferred_language: string | null;
  children_count: number;
  active_subs: number;
}

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.full_name || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8A8F]" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#F0E8EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30 focus:border-[#DCA8B2]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#F0E8EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] border-b border-[#F0E8EB]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Language</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Children</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-[#9B8A8F] uppercase tracking-wider">Subscriptions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8EB]">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3 font-medium text-[#2D2327]">
                    {client.full_name || "—"}
                  </td>
                  <td className="px-5 py-3 text-[#9B8A8F]">
                    {client.phone || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#F0E8EB] text-[#2D2327]">
                      {(client.preferred_language || "en").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Baby className="w-3 h-3 text-[#A9C7E5]" />
                      {client.children_count}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <CreditCard className="w-3 h-3 text-[#DCA8B2]" />
                      {client.active_subs}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#F0E8EB] flex items-center justify-center">
                        <Search className="w-5 h-5 text-[#9B8A8F]" />
                      </div>
                      <p className="text-sm text-[#9B8A8F]">
                        {search ? "No clients match your search" : "No clients yet"}
                      </p>
                      {!search && (
                        <p className="text-xs text-[#9B8A8F]">Clients appear here once they register via the app</p>
                      )}
                    </div>
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
