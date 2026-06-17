"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";

const TYPES = [
  { value: "general", label: "General" },
  { value: "broadcast", label: "Broadcast" },
  { value: "class_reminder", label: "Class reminder" },
  { value: "class_cancelled", label: "Class cancelled" },
  { value: "booking_confirmed", label: "Booking confirmed" },
  { value: "payment_recorded", label: "Payment recorded" },
];

export default function BroadcastForm() {
  const [type, setType] = useState("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<{ sent?: number; failed?: number; error?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          body: body.trim() || undefined,
          link: link.trim() || undefined,
          userId: userId.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");
      setResult({ sent: json.sent, failed: json.failed });
      setStatus("success");
      setTitle("");
      setBody("");
      setLink("");
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Failed" });
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[var(--border)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Send notification</h2>
        <span className="text-xs text-[var(--muted)]">
          Leave User ID blank to broadcast to all users
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)]"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Target User ID (optional)</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="UUID or leave empty"
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
          required
          className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message body (optional)"
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Link (optional)</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="/my/messages or /schedule"
          className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)]"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={status === "loading"}>
          <Send className="w-4 h-4" />
          Send notification
        </Button>
        {status === "success" && (
          <span className="text-xs text-emerald-600 font-medium">
            Sent to {result.sent} user{result.sent === 1 ? "" : "s"}
            {result.failed ? ` (${result.failed} failed)` : ""}
          </span>
        )}
        {status === "error" && (
          <span className="text-xs text-red-500 font-medium">{result.error}</span>
        )}
      </div>
    </form>
  );
}
