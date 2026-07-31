"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Shows who is signed in, top-right of the admin shell.
 *
 * This used to live in per-page layouts that each also re-rendered the whole
 * AdminSidebar, so eight admin pages mounted two sidebars — duplicate DOM and a
 * second copy of the unread-count polling and realtime subscriptions. The shell
 * now lives only in app/admin/layout.tsx and this is the identity part of it.
 *
 * Renders nothing for the shared ADMIN_DASHBOARD_USER cookie login, which has no
 * Supabase session and therefore no identity to show.
 */
export default function AdminUserChip() {
  const [label, setLabel] = useState<string | null>(null);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      setLabel(user.email || user.phone || null);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (!label) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-xs text-[var(--muted)]">{label}</span>
      <div className="w-7 h-7 rounded-full bg-[var(--pink)] flex items-center justify-center shrink-0">
        <span className="text-xs text-white font-medium">
          {label.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
