"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Bell } from "lucide-react";

export type ToastType = "chat" | "notification" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const icons = {
  chat: MessageSquare,
  notification: Bell,
  info: Bell,
};

const styles = {
  chat: "bg-[#FDF2F4] border-[#DCA8B2] text-[#2D2327]",
  notification: "bg-[#EFF6FF] border-[#A9C7E5] text-[#2D2327]",
  info: "bg-white border-[#F0E8EB] text-[#2D2327]",
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20 }}
      className={`pointer-events-auto w-80 rounded-xl border shadow-lg p-4 flex items-start gap-3 ${styles[toast.type]}`}
    >
      <div className="mt-0.5 shrink-0">
        <Icon className="w-4 h-4 text-[#9B8A8F]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[#9B8A8F] mt-0.5 truncate">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-[#9B8A8F] hover:text-[#2D2327] transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
