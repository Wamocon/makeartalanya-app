"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UnreadCounts {
  notifications: number;
  chat: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useUnreadCounts(): UnreadCounts {
  const supabase = createClient();
  const [notifications, setNotifications] = useState(0);
  const [chat, setChat] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const notifChannelId = useMemo(() => `unread-notifications-${Math.random().toString(36).slice(2, 10)}`, []);
  const chatChannelId = useMemo(() => `unread-chat-${Math.random().toString(36).slice(2, 10)}`, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [notifRes, chatRes, userRes] = await Promise.all([
        fetch("/api/notifications/count"),
        fetch("/api/chat/unread"),
        supabase.auth.getUser(),
      ]);

      if (notifRes.ok) {
        const json = await notifRes.json();
        setNotifications(json.count ?? 0);
      }
      if (chatRes.ok) {
        const json = await chatRes.json();
        setChat(json.count ?? 0);
      }
      if (userRes.data.user) {
        setUserId(userRes.data.user.id);
      }
    } catch (err) {
      console.error("[useUnreadCounts] fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCounts();

    const handleFocus = () => fetchCounts();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchCounts]);

  // Subscribe to realtime changes for notifications and chat messages.
  useEffect(() => {
    if (!userId) return;

    const notifChannel = supabase
      .channel(notifChannelId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => setNotifications((prev) => prev + 1)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as { read_at?: string | null } | null;
          if (updated?.read_at) {
            setNotifications((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel(chatChannelId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const message = payload.new as { sender_id: string } | null;
          if (message && message.sender_id !== userId) {
            setChat((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [supabase, userId]);

  return { notifications, chat, loading, refetch: fetchCounts };
}
