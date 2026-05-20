import AdminSidebar from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAttendanceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AdminSidebar />
      <main className="lg:ml-64 min-h-screen">
        <header className="h-16 border-b border-[#F0E8EB] bg-white/80 backdrop-blur-sm flex items-center justify-end px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-[#9B8A8F]">{user.email || user.phone}</span>
            )}
            <div className="w-8 h-8 rounded-full bg-[#DCA8B2] flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
