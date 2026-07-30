"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp } from "lucide-react";
import { ConciergeAvatar } from "@/components/ai/ConciergeAvatar";
import { STARTERS } from "@/lib/ai/starters";
import type { Locale } from "@/i18n/translations";

const textOf = (m: UIMessage) =>
  m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

type UIStrings = {
  open: string;
  title: string;
  subtitle: string;
  greeting: string;
  placeholder: string;
  send: string;
  close: string;
  error: string;
  disclaimer: string;
  typing: string;
};

const UI: Record<Locale, UIStrings> = {
  tr: {
    open: "Asistanı aç",
    title: "Make Art Asistanı",
    subtitle: "Çevrimiçi · genellikle hemen yanıtlar",
    greeting:
      "Merhaba! 👋 Make Art Studio hakkında her şeyi sorabilirsiniz, dersler, satranç, paketler ya da ücretsiz deneme dersi. Size nasıl yardımcı olabilirim?",
    placeholder: "Bir mesaj yazın…",
    send: "Gönder",
    close: "Kapat",
    error: "Bir sorun oluştu. Lütfen tekrar deneyin veya WhatsApp'tan yazın.",
    disclaimer: "Yapay zekâ asistanı. Kesin gün, saat ve kayıt için stüdyo teyit eder.",
    typing: "Asistan yazıyor",
  },
  en: {
    open: "Open assistant",
    title: "Make Art Assistant",
    subtitle: "Online · usually replies right away",
    greeting:
      "Hi! 👋 Ask me anything about Make Art Studio, our classes, chess, packages, or the free trial lesson. How can I help?",
    placeholder: "Type a message…",
    send: "Send",
    close: "Close",
    error: "Something went wrong. Please try again, or message us on WhatsApp.",
    disclaimer: "AI assistant. The studio confirms exact days, times and enrolment.",
    typing: "Assistant is typing",
  },
  ru: {
    open: "Открыть ассистента",
    title: "Ассистент Make Art",
    subtitle: "Онлайн · обычно отвечает сразу",
    greeting:
      "Здравствуйте! 👋 Спросите меня о студии Make Art, занятиях, шахматах, пакетах или бесплатном пробном занятии. Чем могу помочь?",
    placeholder: "Напишите сообщение…",
    send: "Отправить",
    close: "Закрыть",
    error: "Что-то пошло не так. Попробуйте ещё раз или напишите нам в WhatsApp.",
    disclaimer: "ИИ-ассистент. Точные дни, время и запись подтверждает студия.",
    typing: "Ассистент печатает",
  },
};

export function Concierge({ locale }: { locale: Locale }) {
  const t = UI[locale] ?? UI.tr;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { locale } }),
    [locale],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });

  const busy = status === "submitted" || status === "streaming";
  const last = messages[messages.length - 1];
  // Hold the typing indicator until the assistant's first token arrives, so a
  // slow upstream never looks like a dead chat.
  const waiting = busy && (!last || last.role === "user" || textOf(last).length === 0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, open]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      inputRef.current?.focus();
    } else if (wasOpenRef.current) {
      requestAnimationFrame(() => launcherRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
  }

  return (
    <>
      {/* launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            ref={launcherRef}
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            aria-label={t.open}
            className="group fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-[80] size-14 rounded-full p-[3px] shadow-[var(--shadow-xl)] transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--pink), var(--blue))" }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 animate-ping rounded-full bg-[var(--pink)]/30 [animation-duration:2.8s]"
            />
            <ConciergeAvatar className="size-full" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label={t.title}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="glass-strong fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-[80] flex h-[min(76vh,640px)] w-[min(92vw,400px)] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-2xl)]"
          >
            {/* header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white/60 px-4 py-3.5">
              <ConciergeAvatar className="size-10" />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[15px] font-bold text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.title}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  {t.subtitle}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.close}
                className="flex size-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-black/5 hover:text-[var(--foreground)]"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* messages */}
            <div
              ref={scrollRef}
              role="log"
              aria-label={t.title}
              aria-live="polite"
              aria-relevant="additions text"
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            >
              <Bubble role="assistant">{t.greeting}</Bubble>

              {messages.map((m) => (
                <Bubble key={m.id} role={m.role === "user" ? "user" : "assistant"}>
                  {textOf(m)}
                </Bubble>
              ))}

              {waiting && <Typing label={t.typing} />}

              {error && (
                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {t.error}
                </div>
              )}

              {messages.length === 0 && !error && (
                <div className="space-y-2 pt-1">
                  {STARTERS[locale].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submit(q)}
                      className="block w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-2.5 text-left text-sm text-[var(--muted)] transition-all hover:border-[var(--pink)] hover:text-[var(--pink-dark)]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* input */}
            <div className="border-t border-[var(--border)] bg-white/60 px-3 pb-3 pt-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(input);
                    }
                  }}
                  rows={1}
                  placeholder={t.placeholder}
                  aria-label={t.placeholder}
                  className="max-h-28 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)]/60 outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label={t.send}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--pink-dark)] text-white transition-all hover:bg-[var(--pink)] disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
              </form>
              <p className="mt-1.5 px-2 text-[10px] leading-tight text-[var(--muted)]/70">
                {t.disclaimer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-[var(--foreground)] text-white"
            : "rounded-bl-md border border-[var(--border)] bg-white text-[var(--foreground)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <div className="flex justify-start" role="status" aria-label={label}>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--border)] bg-white px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="animate-typing size-1.5 rounded-full bg-[var(--pink)]"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
