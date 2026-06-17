"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useChat, useChatRooms } from "@/hooks/useChat";
import { createClient } from "@/lib/supabase/client";
import ChatWindow from "@/components/chat/ChatWindow";
import ConversationList from "@/components/chat/ConversationList";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

export default function MyMessagesPage() {
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

  const { rooms, loading: roomsLoading, createRoom } = useChatRooms(userId ?? "");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(urlRoomId);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (urlRoomId && rooms.some((r) => r.id === urlRoomId)) {
      setSelectedRoomId(urlRoomId);
    }
  }, [urlRoomId, rooms]);

  const { messages, loading: messagesLoading, sendMessage } = useChat(
    selectedRoomId,
    userId ?? ""
  );

  async function handleStartChat() {
    if (!userId) return;
    setCreating(true);
    try {
      const roomId = await createRoom(userId);
      setSelectedRoomId(roomId);
    } finally {
      setCreating(false);
    }
  }

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--foreground)]">Messages</h1>
          <p className="text-sm text-[var(--muted)]">Chat with the Make Art Studio team</p>
        </div>
        {rooms.length === 0 && (
          <Button onClick={handleStartChat} isLoading={creating}>
            <MessageSquare className="w-4 h-4" />
            Start chat
          </Button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="w-full md:w-72 border-r border-[var(--border)] flex flex-col">
          <div className="p-3 border-b border-[var(--border)] bg-[var(--background)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Conversations</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationList
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelect={setSelectedRoomId}
              currentUserId={userId}
              emptyTitle="No messages yet"
              emptyDescription="Start a chat with the studio team."
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
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[var(--pink-light)] flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[var(--pink-dark)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Select a conversation</h3>
              <p className="text-sm text-[var(--muted)] mt-1 max-w-xs">
                Choose a chat from the sidebar or start a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: full-screen chat when room selected */}
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
