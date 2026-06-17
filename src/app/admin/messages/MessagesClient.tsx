"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, Users } from "lucide-react";
import { useChat, useChatRooms } from "@/hooks/useChat";
import { createClient } from "@/lib/supabase/client";
import ChatWindow from "@/components/chat/ChatWindow";
import ConversationList from "@/components/chat/ConversationList";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { useAdminPresence, usePresenceHeartbeat } from "@/hooks/usePresence";

export default function AdminMessagesPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const searchParams = useSearchParams();
  const urlRoomId = searchParams.get("roomId");

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      setLoadingUser(false);
    }
    getUser();
  }, [supabase]);

  // Heartbeat so other admins see this admin online
  usePresenceHeartbeat(!!userId);

  const { rooms, loading: roomsLoading } = useChatRooms(userId ?? "");
  const { admins } = useAdminPresence(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(urlRoomId);

  useEffect(() => {
    if (urlRoomId && rooms.some((r) => r.id === urlRoomId)) {
      setSelectedRoomId(urlRoomId);
    }
  }, [urlRoomId, rooms]);

  const { messages, loading: messagesLoading, sendMessage } = useChat(
    selectedRoomId,
    userId ?? ""
  );

  if (loadingUser || roomsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="text-[var(--pink)]" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="h-[calc(100vh-120px)] min-h-[500px] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--foreground)]">Support Inbox</h1>
          <p className="text-sm text-[var(--muted)]">Real-time chat with clients</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--muted)]" />
          <span className="text-xs text-[var(--muted)]">Admins online:</span>
          <div className="flex -space-x-2">
            {admins.slice(0, 4).map((admin) => (
              <div
                key={admin.user_id}
                className="w-7 h-7 rounded-full bg-[var(--blue-light)] border-2 border-white flex items-center justify-center text-[10px] font-semibold text-[var(--blue-dark)]"
                title={admin.profiles?.full_name ?? "Admin"}
              >
                {(admin.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
              </div>
            ))}
            {admins.length === 0 && <Badge variant="gray">No admins online</Badge>}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="w-full md:w-80 border-r border-[var(--border)] flex flex-col">
          <div className="p-3 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Conversations</h2>
            <Badge variant="blue">{rooms.length}</Badge>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationList
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelect={setSelectedRoomId}
              currentUserId={userId}
              emptyTitle="No support requests"
              emptyDescription="Client messages will appear here."
            />
          </div>
        </div>

        <div className="hidden md:flex flex-1 flex-col bg-[var(--background)]">
          {selectedRoomId ? (
            <ChatWindow
              messages={messages}
              currentUserId={userId}
              onSend={sendMessage}
              loading={messagesLoading}
              placeholder="Reply as Make Art Studio…"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[var(--pink-light)] flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[var(--pink-dark)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Select a conversation</h3>
              <p className="text-sm text-[var(--muted)] mt-1 max-w-xs">
                Pick a client chat from the sidebar to respond.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {selectedRoomId && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center gap-3 p-3 border-b border-[var(--border)]">
            <button
              onClick={() => setSelectedRoomId(null)}
              className="p-2 rounded-lg hover:bg-[var(--background)] text-[var(--muted)]"
            >
              ← Back
            </button>
            <span className="font-medium text-[var(--foreground)]">Chat</span>
          </div>
          <div className="flex-1 h-[calc(100vh-60px)]">
            <ChatWindow
              messages={messages}
              currentUserId={userId}
              onSend={sendMessage}
              loading={messagesLoading}
              placeholder="Reply as Make Art Studio…"
            />
          </div>
        </div>
      )}
    </div>
  );
}
