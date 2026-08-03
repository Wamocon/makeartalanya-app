-- 0021 — Let a registering parent opt in to Telegram updates
--
-- A Telegram bot cannot open a conversation. It has no way to reach someone by
-- phone number; the person must message the bot first. So we cannot simply
-- "send the parent a Telegram message" after they submit /kayit.
--
-- The supported pattern is a deep link. On submit we mint a single-use token and
-- show the parent a button to https://t.me/<bot>?start=<token>. Tapping it opens
-- Telegram and sends "/start <token>", which is the parent's own first message —
-- and that is what grants the bot permission to reply. The handler matches the
-- token back to this row and stores the chat id, after which the studio can send
-- that parent status updates.
--
-- The token is the only secret involved, so it is single-use and expiring:
-- anyone who obtained one could otherwise bind their own Telegram account to
-- someone else's registration and receive that family's updates.

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS telegram_link_token text,
  ADD COLUMN IF NOT EXISTS telegram_chat_id    text,
  ADD COLUMN IF NOT EXISTS telegram_linked_at  timestamptz;

-- Lookup is by token on every /start, and tokens must not collide.
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_telegram_token
  ON public.registrations(telegram_link_token)
  WHERE telegram_link_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_telegram_chat
  ON public.registrations(telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;

COMMENT ON COLUMN public.registrations.telegram_link_token IS
  'Single-use deep-link token handed to the parent on the /kayit success screen. Cleared once redeemed; treated as expired after 30 days.';
COMMENT ON COLUMN public.registrations.telegram_chat_id IS
  'Telegram chat that consented to receive updates for this registration, set when the parent redeems the token via /start.';
COMMENT ON COLUMN public.registrations.telegram_linked_at IS
  'When the parent redeemed the deep link. Also the record that they opted in.';
