"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkAll() {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      className="text-xs font-medium text-[#A9C7E5] hover:text-[#2D2327] transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Mark all read"}
    </button>
  );
}
