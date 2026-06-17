import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClientNav from "@/components/layout/ClientNav";
import ClientSidebar from "@/components/layout/ClientSidebar";
import { dashboardTranslations } from "@/i18n/dashboard";
import { getLocale } from "@/i18n/server";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = dashboardTranslations[locale];
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/my");
  }

  // Run queries in parallel for faster page load
  const [profileResult, notifCountResult, chatUnreadResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role, preferred_language, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
    supabase
      .from("chat_participants")
      .select("room_id, last_read_at")
      .eq("user_id", user.id),
  ]);

  const profile = profileResult.data;
  const unreadCount = notifCountResult.count;

  // Count unread chat messages
  const roomIds = chatUnreadResult.data?.map((p) => p.room_id) ?? [];
  let chatUnreadCount = 0;
  if (roomIds.length > 0) {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("room_id, sender_id, created_at")
      .in("room_id", roomIds)
      .neq("sender_id", user.id);
    const lastReadMap = new Map(chatUnreadResult.data?.map((p) => [p.room_id, p.last_read_at]));
    for (const message of messages ?? []) {
      const lastRead = lastReadMap.get(message.room_id);
      if (!lastRead || new Date(message.created_at) > new Date(lastRead)) {
        chatUnreadCount++;
      }
    }
  }

  const userName = profile?.full_name || user.email || "User";
  const userEmail = user.email || "";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop: sidebar + content */}
      <div className="hidden lg:flex">
        <ClientSidebar
          userName={userName}
          userEmail={userEmail}
          avatarUrl={profile?.avatar_url}
          unreadCount={unreadCount || 0}
          chatUnreadCount={chatUnreadCount}
          navLabels={t.nav}
        />
        <main className="flex-1 min-h-screen pl-64">
          <div className="max-w-4xl mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile: content + bottom nav */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <main className="flex-1 pb-24 px-4 sm:px-6 pt-6 sm:pt-8 max-w-xl mx-auto w-full">
          {children}
        </main>
        <ClientNav userName={userName} unreadCount={unreadCount || 0} chatUnreadCount={chatUnreadCount} navLabels={t.nav} />
      </div>
    </div>
  );
}
