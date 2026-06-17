"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLocaleProvider from "@/components/admin/AdminLocaleProvider";
import AdminPresenceBar from "@/components/admin/AdminPresenceBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminLocaleProvider>
      <div className="min-h-screen bg-[var(--background)]">
        <AdminSidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {!isLoginPage && <AdminPresenceBar />}
            {children}
          </div>
        </main>
      </div>
    </AdminLocaleProvider>
  );
}
