"use client";

import Image from "next/image";

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
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
}

export default function MessageBubble({ message, isMe, showAvatar = true }: Props) {
  const sender = message.profiles;
  const initials = (sender?.full_name ?? "?").charAt(0).toUpperCase();
  const isStaff = sender?.role === "admin" || sender?.role === "trainer";

  return (
    <div className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
      {showAvatar && (
        <div className="shrink-0">
          {sender?.avatar_url ? (
            <Image
              src={sender.avatar_url}
              alt={sender.full_name ?? ""}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                isStaff ? "bg-[var(--blue-light)] text-[var(--blue-dark)]" : "bg-[var(--pink-light)] text-[var(--pink-dark)]"
              }`}
            >
              {initials}
            </div>
          )}
        </div>
      )}
      <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? "bg-[var(--foreground)] text-white rounded-br-md"
              : "bg-white border border-[var(--border)] text-[var(--foreground)] rounded-bl-md"
          }`}
        >
          {message.content}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[10px] text-[var(--muted)]">
            {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isMe && message.read_at && (
            <span className="text-[10px] text-[var(--blue-dark)]">Read</span>
          )}
        </div>
      </div>
    </div>
  );
}
