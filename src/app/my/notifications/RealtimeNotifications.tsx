"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Calendar, AlertTriangle, Sparkles, Info, Check, Bell } from "lucide-react";
import MarkAllReadButton from "./MarkAllReadButton";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

function getIcon(type: string) {
  switch (type) {
    case "booking_confirmed":
    case "session_reminder":
    case "class_reminder":
      return <Calendar className="w-4 h-4 text-[#A9C7E5]" />;
    case "warning":
    case "subscription_expiring":
    case "sub_expiring":
    case "sub_low":
      return <AlertTriangle className="w-4 h-4 text-[#F2B63D]" />;
    case "waitlist_available":
      return <Sparkles className="w-4 h-4 text-[#A9C7E5]" />;
    default:
      return <Info className="w-4 h-4 text-[#DCA8B2]" />;
  }
}

export default function RealtimeNotifications({
  initialNotifications,
  userId,
}: {
  initialNotifications: Notification[];
  userId: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const unread = notifications.filter((n) => !n.read_at);
  const read = notifications.filter((n) => n.read_at);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#2D2327]">Notifications</h1>
        <div className="flex items-center gap-3">
          {unread.length > 0 && (
            <>
              <span className="text-xs text-[#DCA8B2] font-medium">
                {unread.length} unread
              </span>
              <MarkAllReadButton />
            </>
          )}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {/* Unread */}
          {unread.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#9B8A8F] mb-2">New</h2>
              <div className="space-y-2">
                {unread.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 bg-white rounded-xl border border-[#DCA8B2]/30 p-3 animate-in fade-in">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2D2327]">{n.title}</p>
                      {n.body && <p className="text-xs text-[#9B8A8F] mt-0.5">{n.body}</p>}
                      <p className="text-[10px] text-[#9B8A8F] mt-1">
                        {new Date(n.created_at).toLocaleString("en", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#DCA8B2] mt-2 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Read */}
          {read.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#9B8A8F] mb-2">Earlier</h2>
              <div className="space-y-2">
                {read.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 bg-white rounded-xl border border-[#F0E8EB] p-3 opacity-70">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2D2327]">{n.title}</p>
                      {n.body && <p className="text-xs text-[#9B8A8F] mt-0.5">{n.body}</p>}
                      <p className="text-[10px] text-[#9B8A8F] mt-1">
                        {new Date(n.created_at).toLocaleString("en", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Check className="w-3 h-3 text-[#9B8A8F] mt-2 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-[#F0E8EB]">
          <Bell className="w-10 h-10 text-[#9B8A8F]/30 mx-auto mb-3" />
          <p className="text-[#9B8A8F] font-medium">No notifications</p>
          <p className="text-xs text-[#9B8A8F] mt-1">You&apos;ll see booking confirmations and reminders here</p>
        </div>
      )}
    </div>
  );
}
