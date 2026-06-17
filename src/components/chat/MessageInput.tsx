"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ onSend, disabled, placeholder = "Type a message…" }: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setValue("");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 bg-white border-t border-[var(--border)]">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder={placeholder}
        disabled={disabled || sending}
        rows={1}
        className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-[var(--background)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] border border-[var(--border)] focus:outline-none focus:border-[var(--pink)] focus:ring-2 focus:ring-[var(--pink)]/10 disabled:opacity-60"
      />
      <Button type="submit" size="md" isLoading={sending} disabled={!value.trim()}>
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
