"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface AdminPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  path: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useAdminPresence(isAdmin: boolean) {
  const supabase = useMemo(() => createClient(), []);
  const [admins, setAdmins] = useState<AdminPresence[]>([]);
  const [loading, setLoading] = useState(false);
  const channelId = useMemo(() => `admin-presence-changes-${Math.random().toString(36).slice(2, 10)}`, []);

  const fetchPresence = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await fetch("/api/presence");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load presence");
      setAdmins(json.admins ?? []);
    } catch (err) {
      console.error("[useAdminPresence]", err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPresence();
  }, [fetchPresence]);

  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_presence" },
        () => fetchPresence()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, fetchPresence, isAdmin, supabase]);

  return { admins, loading, refetch: fetchPresence };
}

export function usePresenceHeartbeat(enabled: boolean, path?: string) {
  useEffect(() => {
    if (!enabled) return;

    async function heartbeat() {
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: path ?? window.location.pathname }),
        });
      } catch {
        // Non-critical
      }
    }

    heartbeat();
    const interval = setInterval(heartbeat, 30_000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") heartbeat();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, path]);
}
