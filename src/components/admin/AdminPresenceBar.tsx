"use client";

import { useAdminPresence, usePresenceHeartbeat } from "@/hooks/usePresence";

export default function AdminPresenceBar() {
  usePresenceHeartbeat(true);
  const { admins } = useAdminPresence(true);

  if (admins.length === 0) return null;

  return (
    <div className="hidden lg:flex items-center justify-end gap-2 mb-4">
      <span className="text-[11px] text-[var(--muted)]">Admins online</span>
      <div className="flex -space-x-2">
        {admins.slice(0, 4).map((admin) => (
          <div
            key={admin.user_id}
            className="w-7 h-7 rounded-full bg-[var(--blue-light)] border-2 border-white flex items-center justify-center text-[10px] font-semibold text-[var(--blue-dark)]"
            title={admin.profiles?.full_name ?? "Admin"}
          >
            {(admin.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      {admins.length > 4 && (
        <span className="text-[10px] text-[var(--muted)]">+{admins.length - 4}</span>
      )}
    </div>
  );
}
