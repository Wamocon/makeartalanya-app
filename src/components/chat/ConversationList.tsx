"use client";

import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface Participant {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
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
  participants: Participant[];
  unread_count?: number;
}

interface Props {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  currentUserId: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function ConversationList({
  rooms,
  selectedRoomId,
  onSelect,
  currentUserId,
  emptyTitle = "No conversations yet",
  emptyDescription = "Messages will appear here once you start chatting.",
}: Props) {
  if (rooms.length === 0) {
    return (
      <div className="p-4">
        <EmptyState icon={MessageSquare} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {rooms.map((room) => {
        const other = room.participants.find((p) => p.id !== currentUserId);
        const title = room.title || other?.full_name || "Support";
        const lastMessage = room.last_message;

        return (
          <button
            key={room.id}
            onClick={() => onSelect(room.id)}
            className={`w-full text-left px-4 py-3 border-b border-[var(--border)] transition-colors ${
              selectedRoomId === room.id ? "bg-[var(--pink-light)]" : "hover:bg-[var(--background)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-[var(--foreground)] truncate pr-2">{title}</span>
              {lastMessage && (
                <span className="text-[10px] text-[var(--muted)] shrink-0">
                  {new Date(lastMessage.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--muted)] truncate pr-2 max-w-[80%]">
                {lastMessage ? lastMessage.content : "No messages yet"}
              </p>
              {room.unread_count ? (
                <span className="w-5 h-5 bg-[var(--pink)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                  {room.unread_count > 9 ? "9+" : room.unread_count}
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
