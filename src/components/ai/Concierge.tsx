"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUp,
  BookOpen,
  Gift,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { ConciergeAvatar } from "@/components/ai/ConciergeAvatar";
import { STARTERS } from "@/lib/ai/starters";
import {
  CHAT_MAX_MESSAGE_LENGTH,
  containsInstructionAttack,
  containsRestrictedChatData,
} from "@/lib/ai/safety";
import type { Locale } from "@/i18n/translations";

const AI_CONSENT_KEY = "makeart_ai_transfer_consent_2026_07";

const textOf = (message: UIMessage) =>
  message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

type UIStrings = {
  open: string;
  launcher: string;
  title: string;
  subtitle: string;
  canvasTitle: string;
  greeting: string;
  promptHeading: string;
  placeholder: string;
  send: string;
  close: string;
  expand: string;
  restore: string;
  error: string;
  disclaimer: string;
  typing: string;
  privacy: string;
  transferTitle: string;
  transferNotice: (provider: string) => string;
  transferConsent: (provider: string) => string;
  enable: string;
  withdraw: string;
  safety: string;
  injection: string;
  tooLong: string;
};

const UI: Record<Locale, UIStrings> = {
  tr: {
    open: "Asistanı aç",
    launcher: "Sanat asistanına sor",
    title: "Make Art Asistanı",
    subtitle: "Çevrimiçi · yaratmaya hazır",
    canvasTitle: "Birlikte ne yaratıyoruz?",
    greeting:
      "Merhaba! Dersler, atölyeler, satranç ve ücretsiz deneme dersi hakkında bana sorabilirsiniz. Size nasıl yardımcı olabilirim?",
    promptHeading: "Şunlarla başlayabilirsiniz",
    placeholder: "Bir şey sorun…",
    send: "Gönder",
    close: "Kapat",
    expand: "Stüdyo görünümünü genişlet",
    restore: "Kompakt görünüme dön",
    error: "Bir sorun oluştu. Lütfen tekrar deneyin veya WhatsApp'tan yazın.",
    disclaimer: "Yapay zekâ asistanı. Kesin gün, saat ve kayıt için stüdyo teyit eder.",
    typing: "Asistan yazıyor",
    privacy: "AI ve KVKK",
    transferTitle: "Gizlilik tercihiniz",
    transferNotice: (provider) =>
      `Mesajlarınız yanıt üretmek için ${provider} hizmetine ve yurt dışındaki altyapısına gönderilir. Sohbete ad, telefon, e-posta, kimlik, adres veya sağlık bilgisi yazmayın.`,
    transferConsent: (provider) =>
      `Aydınlatmayı okudum ve yalnızca yazmayı seçtiğim mesajların ${provider} aracılığıyla yurt dışında işlenmesine açık rıza veriyorum.`,
    enable: "Asistanı etkinleştir",
    withdraw: "AI rızasını geri çek",
    safety:
      "Lütfen sohbete telefon, e-posta, kimlik, adres, bağlantı veya sağlık bilgisi yazmayın. Bunun için güvenli kayıt formunu kullanın.",
    injection:
      "Asistanın kurallarını değiştiren veya gizli talimatlarını isteyen mesajlar kabul edilmez. Make Art Studio hakkında bir soru sorabilirsiniz.",
    tooLong: "Mesaj çok uzun. Lütfen daha kısa bir soru yazın.",
  },
  en: {
    open: "Open assistant",
    launcher: "Ask the art assistant",
    title: "Make Art Assistant",
    subtitle: "Online · ready to create",
    canvasTitle: "What shall we create together?",
    greeting:
      "Hi! Ask me about classes, workshops, chess, or a free trial lesson. How can I help?",
    promptHeading: "You could start here",
    placeholder: "Ask something…",
    send: "Send",
    close: "Close",
    expand: "Expand studio view",
    restore: "Return to compact view",
    error: "Something went wrong. Please try again, or message us on WhatsApp.",
    disclaimer: "AI assistant. The studio confirms exact days, times and enrolment.",
    typing: "Assistant is typing",
    privacy: "AI and privacy",
    transferTitle: "Your privacy choice",
    transferNotice: (provider) =>
      `Your messages are sent to ${provider} and its overseas infrastructure to generate a reply. Do not enter names, phone numbers, email addresses, IDs, addresses or health information.`,
    transferConsent: (provider) =>
      `I have read the notice and explicitly consent to the overseas processing, through ${provider}, of only the messages I choose to type.`,
    enable: "Enable assistant",
    withdraw: "Withdraw AI consent",
    safety:
      "Do not put phone numbers, email addresses, IDs, addresses, links or health information in chat. Use the secure registration form instead.",
    injection:
      "Requests to change the assistant's rules or reveal hidden instructions are not accepted. You can ask about Make Art Studio instead.",
    tooLong: "That message is too long. Please send a shorter question.",
  },
  ru: {
    open: "Открыть ассистента",
    launcher: "Спросить арт-ассистента",
    title: "Ассистент Make Art",
    subtitle: "Онлайн · готов творить",
    canvasTitle: "Что мы создадим вместе?",
    greeting:
      "Здравствуйте! Спросите меня о занятиях, мастер-классах, шахматах или бесплатном пробном уроке. Чем могу помочь?",
    promptHeading: "Можно начать отсюда",
    placeholder: "Задайте вопрос…",
    send: "Отправить",
    close: "Закрыть",
    expand: "Расширить окно",
    restore: "Вернуться к компактному виду",
    error: "Что-то пошло не так. Попробуйте ещё раз или напишите нам в WhatsApp.",
    disclaimer: "ИИ-ассистент. Точные дни, время и запись подтверждает студия.",
    typing: "Ассистент печатает",
    privacy: "ИИ и конфиденциальность",
    transferTitle: "Ваш выбор конфиденциальности",
    transferNotice: (provider) =>
      `Для подготовки ответа сообщения передаются сервису ${provider} и обрабатываются за пределами Турции. Не вводите имена, телефоны, email, документы, адреса или сведения о здоровье.`,
    transferConsent: (provider) =>
      `Я прочитал(а) уведомление и явно соглашаюсь на обработку за рубежом, через ${provider}, только тех сообщений, которые решу написать.`,
    enable: "Включить ассистента",
    withdraw: "Отозвать согласие на ИИ",
    safety:
      "Не вводите в чат телефон, email, документы, адрес, ссылки или сведения о здоровье. Используйте защищённую форму записи.",
    injection:
      "Запросы на изменение правил ассистента или раскрытие скрытых инструкций не принимаются. Вы можете спросить о Make Art Studio.",
    tooLong: "Сообщение слишком длинное. Напишите вопрос короче.",
  },
};

export function Concierge({
  locale,
  externalProvider,
  providerName,
}: {
  locale: Locale;
  externalProvider: boolean;
  providerName: string;
}) {
  const t = UI[locale] ?? UI.tr;
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [transferConsent, setTransferConsent] = useState(!externalProvider);
  const [consentChecked, setConsentChecked] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { locale, transferConsent },
      }),
    [locale, transferConsent],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });

  const busy = status === "submitted" || status === "streaming";
  const last = messages[messages.length - 1];
  const waiting = busy && (!last || last.role === "user" || textOf(last).length === 0);

  useEffect(() => {
    if (!externalProvider) return;
    setTransferConsent(localStorage.getItem(AI_CONSENT_KEY) === "accepted");
  }, [externalProvider]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages, status, open, reduceMotion]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      if (transferConsent) requestAnimationFrame(() => inputRef.current?.focus());
    } else if (wasOpenRef.current) {
      requestAnimationFrame(() => launcherRef.current?.focus());
    }
  }, [open, transferConsent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy || !transferConsent) return;
    if (value.length > CHAT_MAX_MESSAGE_LENGTH) {
      setSafetyError(t.tooLong);
      return;
    }
    if (containsRestrictedChatData(value)) {
      setSafetyError(t.safety);
      return;
    }
    if (containsInstructionAttack(value)) {
      setSafetyError(t.injection);
      return;
    }
    setSafetyError(null);
    sendMessage({ text: value });
    setInput("");
  }

  function acceptTransfer() {
    if (!consentChecked) return;
    localStorage.setItem(AI_CONSENT_KEY, "accepted");
    setTransferConsent(true);
    setSafetyError(null);
  }

  function withdrawTransfer() {
    localStorage.removeItem(AI_CONSENT_KEY);
    setTransferConsent(false);
    setConsentChecked(false);
    setInput("");
    setSafetyError(null);
  }

  const panelSize = expanded
    ? "sm:h-[min(88dvh,780px)] sm:w-[min(90vw,820px)]"
    : "sm:h-[min(82dvh,720px)] sm:w-[min(92vw,500px)]";

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.div
            key="launcher"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.94 }}
            transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-[90] flex items-center gap-2 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-[calc(1.5rem+env(safe-area-inset-right))]"
          >
            <span className="pointer-events-none hidden rounded-full border border-white/20 bg-[#1d181a]/92 px-4 py-2.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_18px_50px_rgba(0,0,0,.28)] backdrop-blur-md sm:block">
              {t.launcher}
            </span>
            <button
              ref={launcherRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.open}
              className="group relative size-16 shrink-0 rounded-full border-2 border-[#fff8ee] bg-[#fff8ee] p-1.5 shadow-[0_20px_55px_rgba(0,0,0,.35)] outline-none transition-transform hover:scale-[1.04] focus-visible:ring-4 focus-visible:ring-[#e8a0b0]/55 sm:size-[68px]"
            >
              <span
                aria-hidden="true"
                className="absolute -left-1 top-2 size-3 rounded-full bg-[#e86d87] shadow-[17px_-7px_0_-2px_#8cb8d9,9px_47px_0_-3px_#d9a13a]"
              />
              <ConciergeAvatar className="size-full transition-transform duration-300 group-hover:-rotate-6" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.section
            key="panel"
            role="dialog"
            aria-label={t.title}
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed bottom-2 left-2 right-2 z-[90] flex h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-[30px] border border-[#2b2021]/15 text-[#21191b] shadow-[0_32px_100px_rgba(0,0,0,.42)] sm:bottom-5 sm:left-auto sm:right-5 ${panelSize}`}
            style={{
              backgroundColor: "#f7f2e9",
              backgroundImage:
                "radial-gradient(circle at 18% 8%, rgba(232,160,176,.13), transparent 25%), repeating-linear-gradient(0deg, rgba(52,39,41,.018) 0, rgba(52,39,41,.018) 1px, transparent 1px, transparent 5px)",
            }}
          >
            <header className="relative flex items-center gap-3 px-4 pb-5 pt-4 sm:px-5 sm:pt-5">
              <ConciergeAvatar className="size-12 shadow-[0_8px_24px_rgba(41,29,31,.13)] sm:size-14" />
              <div className="min-w-0 flex-1">
                <h2
                  className="truncate text-[20px] font-bold leading-tight tracking-[-0.025em] sm:text-[24px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.title}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-[11px] font-medium text-[#74696b] sm:text-xs">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  {t.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  aria-label={expanded ? t.restore : t.expand}
                  aria-pressed={expanded}
                  className="hidden size-10 items-center justify-center rounded-full border border-[#2b2021]/12 bg-white/55 text-[#5f5557] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e86d87] sm:flex"
                >
                  {expanded ? <Minimize2 className="size-[18px]" /> : <Maximize2 className="size-[18px]" />}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.close}
                  className="flex size-10 items-center justify-center rounded-full border border-[#2b2021]/12 bg-white/55 text-[#5f5557] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e86d87]"
                >
                  <X className="size-5" />
                </button>
              </div>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-4 right-4 h-[7px] rounded-[100%] bg-[#e86d87] [clip-path:polygon(0_30%,8%_18%,22%_35%,43%_12%,68%_28%,84%_10%,100%_36%,100%_67%,83%_52%,62%_74%,37%_49%,18%_70%,0_54%)]"
              />
            </header>

            <div
              ref={scrollRef}
              role="log"
              aria-label={t.title}
              aria-live="polite"
              aria-relevant="additions text"
              className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
            >
              <div className={`mx-auto w-full ${expanded ? "max-w-3xl" : "max-w-xl"}`}>
                <h3
                  className="mb-5 text-center text-[21px] font-bold tracking-[-0.025em] sm:text-[26px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.canvasTitle}
                </h3>

                {!transferConsent ? (
                  <ConsentCard
                    title={t.transferTitle}
                    notice={t.transferNotice(providerName)}
                    consent={t.transferConsent(providerName)}
                    privacy={t.privacy}
                    enable={t.enable}
                    checked={consentChecked}
                    onChecked={setConsentChecked}
                    onAccept={acceptTransfer}
                  />
                ) : (
                  <div className="space-y-4">
                    <Bubble role="assistant">{t.greeting}</Bubble>

                    {messages.map((message) => (
                      <Bubble key={message.id} role={message.role === "user" ? "user" : "assistant"}>
                        {textOf(message)}
                      </Bubble>
                    ))}

                    {waiting ? <Typing label={t.typing} /> : null}

                    {error ? (
                      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {t.error}
                      </div>
                    ) : null}

                    {safetyError ? (
                      <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
                        {safetyError}
                      </div>
                    ) : null}

                    {messages.length === 0 && !error && !safetyError ? (
                      <StarterPrompts heading={t.promptHeading} prompts={STARTERS[locale]} onChoose={submit} />
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <footer className="border-t border-[#2b2021]/10 bg-[#fffaf2]/88 px-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:px-5 sm:pb-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit(input);
                }}
                className="mx-auto flex max-w-3xl items-end gap-2 rounded-[22px] border border-[#2b2021]/18 bg-white px-3 py-2 shadow-[0_8px_24px_rgba(46,32,35,.07)] focus-within:border-[#e86d87]/60 focus-within:ring-4 focus-within:ring-[#e8a0b0]/15"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit(input);
                    }
                  }}
                  rows={1}
                  maxLength={CHAT_MAX_MESSAGE_LENGTH}
                  disabled={!transferConsent}
                  placeholder={t.placeholder}
                  aria-label={t.placeholder}
                  className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-5 text-[#21191b] placeholder:text-[#8d8384] focus:outline-none disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!transferConsent || busy || !input.trim()}
                  aria-label={t.send}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e86d87] text-white shadow-[0_6px_18px_rgba(232,109,135,.32)] transition-colors hover:bg-[#d95f79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#21191b] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowUp className="size-[18px]" />
                </button>
              </form>
              <div className="mx-auto mt-2 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-center text-[10px] leading-relaxed text-[#7d7274] sm:text-[11px]">
                <span>{t.disclaimer}</span>
                <Link href="/privacy#ai-assistant" target="_blank" className="font-semibold underline decoration-[#e86d87] underline-offset-2">
                  {t.privacy}
                </Link>
                {externalProvider && transferConsent ? (
                  <button type="button" onClick={withdrawTransfer} className="underline underline-offset-2">
                    {t.withdraw}
                  </button>
                ) : null}
              </div>
            </footer>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ConsentCard({
  title,
  notice,
  consent,
  privacy,
  enable,
  checked,
  onChecked,
  onAccept,
}: {
  title: string;
  notice: string;
  consent: string;
  privacy: string;
  enable: string;
  checked: boolean;
  onChecked: (checked: boolean) => void;
  onAccept: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-[26px] border border-[#2b2021]/12 bg-white/86 p-5 shadow-[0_18px_45px_rgba(42,29,31,.08)] sm:p-6">
      <div className="mb-4 flex items-center gap-3 text-base font-bold">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#e8f2f8] text-[#4f96c5]">
          <ShieldCheck className="size-5" />
        </span>
        {title}
      </div>
      <p className="text-[13px] leading-6 text-[#6f6567]">
        {notice}{" "}
        <Link href="/privacy#ai-assistant" target="_blank" className="font-semibold text-[#be5e75] underline underline-offset-2">
          {privacy}
        </Link>
      </p>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-[13px] leading-6 text-[#403638]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChecked(event.target.checked)}
          className="mt-1 size-[18px] shrink-0 accent-[#d96680]"
        />
        <span>{consent}</span>
      </label>
      <button
        type="button"
        disabled={!checked}
        onClick={onAccept}
        className="mt-5 w-full rounded-full bg-[#21191b] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3a2d30] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e8a0b0]/40 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {enable}
      </button>
    </div>
  );
}

function StarterPrompts({
  heading,
  prompts,
  onChoose,
}: {
  heading: string;
  prompts: string[];
  onChoose: (prompt: string) => void;
}) {
  const icons = [BookOpen, Gift, Sparkles];
  const tones = [
    "bg-[#f9dde4] text-[#c75670]",
    "bg-[#dfeef7] text-[#4e96c5]",
    "bg-[#f6e7bf] text-[#a97820]",
  ];

  return (
    <div className="pt-2">
      <div className="mb-3 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#82777a]">
        <span className="h-px flex-1 bg-[#2b2021]/12" />
        {heading}
        <span className="h-px flex-1 bg-[#2b2021]/12" />
      </div>
      <div className="space-y-2">
        {prompts.slice(0, 3).map((prompt, index) => {
          const Icon = icons[index] ?? Sparkles;
          return (
            <button
              key={prompt}
              type="button"
              onClick={() => onChoose(prompt)}
              className="group flex w-full items-center gap-3 rounded-[18px] border border-[#2b2021]/12 bg-white/72 px-3 py-2.5 text-left text-[13px] font-medium text-[#443a3c] shadow-[0_5px_18px_rgba(47,32,35,.04)] transition-colors hover:border-[#e86d87]/45 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e86d87] sm:text-sm"
            >
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${tones[index] ?? tones[0]}`}>
                <Icon className="size-4" />
              </span>
              <span className="flex-1">{prompt}</span>
              <ArrowUp className="size-4 rotate-45 text-[#a09798] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? <ConciergeAvatar className="mb-1 size-8 shadow-sm" /> : null}
      <div
        className={`max-w-[84%] whitespace-pre-wrap px-4 py-3 text-[13px] leading-6 shadow-[0_8px_24px_rgba(47,32,35,.06)] sm:text-sm ${
          isUser
            ? "rounded-[20px] rounded-br-[6px] bg-[#cfe3f1] text-[#26343d]"
            : "rounded-[20px] rounded-bl-[6px] border border-[#2b2021]/10 bg-white text-[#302628]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <div className="flex items-end gap-2" role="status" aria-label={label}>
      <ConciergeAvatar className="mb-1 size-8 shadow-sm" />
      <div className="flex items-center gap-1.5 rounded-[18px] rounded-bl-[6px] border border-[#2b2021]/10 bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden="true"
            className="animate-typing size-1.5 rounded-full bg-[#e86d87]"
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
