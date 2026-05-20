import { createClient } from "@/lib/supabase/server";
import RealtimeNotifications from "./RealtimeNotifications";

export default async function MyNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, read_at, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <RealtimeNotifications
      initialNotifications={notifications || []}
      userId={user!.id}
    />
  );
}
