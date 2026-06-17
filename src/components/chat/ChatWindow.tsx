"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  read_at?: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

interface Props {
  messages: Message[];
  currentUserId: string;
  onSend: (content: string) => void | Promise<void>;
  loading?: boolean;
  placeholder?: string;
}

export default function ChatWindow({ messages, currentUserId, onSend, loading, placeholder }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[var(--background)] rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="text-[var(--pink)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Send your first message to start the conversation."
            />
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMe={message.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={onSend} disabled={loading} placeholder={placeholder} />
    </div>
  );
}
