"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ToastContainer, type ToastItem, type ToastType } from "@/components/ui/Toast";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.showToast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { chat, notifications } = useUnreadCounts();
  const prevChat = useRef(chat);
  const prevNotifications = useRef(notifications);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (chat > prevChat.current) {
      showToast("chat", "New message", "You have a new chat message");
    }
    prevChat.current = chat;
  }, [chat, showToast]);

  useEffect(() => {
    if (notifications > prevNotifications.current) {
      showToast("notification", "New notification", "You have a new notification");
    }
    prevNotifications.current = notifications;
  }, [notifications, showToast]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
