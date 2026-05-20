import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLocaleProvider from "@/components/admin/AdminLocaleProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLocaleProvider>
      <div className="min-h-screen bg-[#FAFAFA]">
        <AdminSidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AdminLocaleProvider>
  );
}
