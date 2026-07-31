"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLocaleProvider from "@/components/admin/AdminLocaleProvider";
import AdminPresenceBar from "@/components/admin/AdminPresenceBar";
import AdminUserChip from "@/components/admin/AdminUserChip";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminLocaleProvider>
      <div className="min-h-screen bg-[var(--background)]">
        <AdminSidebar />
        <main className="lg:ml-64 min-h-screen">
          {!isLoginPage && (
            <header className="h-16 border-b border-[var(--border)] bg-white/80 backdrop-blur-sm flex items-center justify-end gap-4 px-4 sm:px-6 sticky top-0 z-30">
              <AdminPresenceBar />
              <AdminUserChip />
            </header>
          )}
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminLocaleProvider>
  );
}
