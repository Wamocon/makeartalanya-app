import { createClient } from "@/lib/supabase/server";
import { Bell, Send, Mail, MessageSquare, Smartphone } from "lucide-react";
import BroadcastForm from "./BroadcastForm";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en", { month: "short", day: "numeric" });
}

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  sms: Smartphone,
  push: MessageSquare,
};

export default async function AdminNotificationsPage() {
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, type, channel, sent_at, created_at, user_id, profiles:user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2327] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#F2D479]" />
            Notifications
          </h1>
          <p className="text-sm text-[#9B8A8F] mt-1">
            {notifications?.length || 0} sent notifications
          </p>
        </div>
      </div>

      <BroadcastForm />

      <div className="space-y-2">
        {notifications && notifications.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          notifications.map((n: any) => {
            const profile = Array.isArray(n.profiles) ? n.profiles[0] : n.profiles;
            const ChannelIcon = channelIcons[n.channel] || Send;
            return (
              <div key={n.id} className="bg-white rounded-xl border border-[#F0E8EB] p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-[#F0E8EB] flex items-center justify-center shrink-0">
                  <ChannelIcon className="w-4 h-4 text-[#9B8A8F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-[#2D2327] truncate">{n.title}</p>
                    <span className="text-[10px] text-[#9B8A8F] shrink-0">{relativeTime(n.created_at)}</span>
                  </div>
                  <p className="text-xs text-[#9B8A8F] mt-0.5 line-clamp-1">{n.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0E8EB] text-[#9B8A8F] font-medium">{n.type}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A9C7E5]/10 text-[#A9C7E5] font-medium">{n.channel || "push"}</span>
                    <span className="text-[10px] text-[#9B8A8F]">
                      → {profile?.full_name || "All users"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-[#F0E8EB]">
            <Bell className="w-10 h-10 text-[#9B8A8F]/30 mx-auto mb-3" />
            <p className="text-[#9B8A8F] font-medium">No notifications sent yet</p>
            <p className="text-xs text-[#9B8A8F] mt-1">Notifications will appear here once they are sent to users</p>
          </div>
        )}
      </div>
    </div>
  );
}
