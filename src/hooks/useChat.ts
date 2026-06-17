"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

interface Room {
  id: string;
  title: string | null;
  type: string;
  created_at: string;
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  participants: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  }[];
}

export function useChat(roomId: string | null, userId: string) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/messages?roomId=${roomId}`);
      if (res.status === 401) {
        setMessages([]);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load messages");
      setMessages(json.messages ?? []);
    } catch (err) {
      console.error("[useChat]", err);
      setError(err instanceof Error ? err.message : "Error loading messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [roomId, userId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markRead = useCallback(async (messageId?: string) => {
    if (!roomId) return;
    await fetch("/api/chat/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, messageIds: messageId ? [messageId] : undefined }),
    });
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat-messages-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          // Enrich with sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, role")
            .eq("id", newMessage.sender_id)
            .single();
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, { ...newMessage, profiles: profile }];
          });
          // Mark as read if not from current user
          if (newMessage.sender_id !== userId) {
            markRead(newMessage.id).catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase, userId, markRead]);

  async function sendMessage(content: string) {
    if (!roomId || !userId) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");
      setMessages((prev) => {
        if (prev.some((m) => m.id === json.message.id)) return prev;
        return [...prev, json.message];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
      throw err;
    } finally {
      setSending(false);
    }
  }

  return { messages, loading, sending, error, sendMessage, markRead, refetch: fetchMessages };
}

export function useChatRooms(userId: string) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const channelId = useMemo(() => `chat-rooms-changes-${Math.random().toString(36).slice(2, 10)}`, []);

  const fetchRooms = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat/rooms");
      if (res.status === 401) {
        setRooms([]);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load rooms");
      setRooms(json.rooms ?? []);
    } catch (err) {
      console.error("[useChatRooms]", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => fetchRooms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchRooms]);

  async function createRoom(targetUserId: string, title?: string) {
    const res = await fetch("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: targetUserId, title }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create room");
    await fetchRooms();
    return json.roomId as string;
  }

  return { rooms, loading, refetch: fetchRooms, createRoom };
}
