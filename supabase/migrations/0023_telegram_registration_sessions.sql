-- 0023 — Conversation state for registering through the Telegram bot
--
-- The bot asks one question per message, so it has to remember where a chat got
-- to and what has been answered so far. Telegram itself is stateless: every
-- update arrives naked, with nothing but the chat id to tie it to what came
-- before. That id is the natural primary key — one conversation per chat.
--
-- `data` holds the partial answers. It is deliberately jsonb rather than a
-- column per field: this is scratch space for a half-finished form, and the
-- real, validated record only ever lands in `registrations` on submit. Keeping
-- it loose means adding a question to the flow needs no migration.
--
-- Nothing here is a consent record. Consent is stored on the registration row
-- with its wording version, exactly as the web form does it.

CREATE TABLE IF NOT EXISTS public.telegram_sessions (
  chat_id     bigint PRIMARY KEY,
  locale      text NOT NULL DEFAULT 'en' CHECK (locale IN ('tr', 'en', 'ru')),
  step        text NOT NULL,
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Abandoned half-finished conversations are swept by updated_at; a parent who
-- wanders off mid-form should not have their answers kept indefinitely.
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_updated
  ON public.telegram_sessions(updated_at);

ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- No client ever touches this table: the bot runs server-side with the service
-- role, which bypasses RLS. Admins may read it for support purposes.
DROP POLICY IF EXISTS "admin_read_telegram_sessions" ON public.telegram_sessions;
CREATE POLICY "admin_read_telegram_sessions" ON public.telegram_sessions
  FOR SELECT USING (public.is_admin());

COMMENT ON TABLE public.telegram_sessions IS
  'In-progress Telegram registration conversations. Scratch space only — the completed record goes to public.registrations.';
COMMENT ON COLUMN public.telegram_sessions.step IS
  'Key of the question currently awaiting an answer, or a control state such as language/menu.';
