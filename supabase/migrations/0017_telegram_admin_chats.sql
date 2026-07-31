-- 0017 — Telegram admin recipients live in the database
--
-- TELEGRAM_ADMIN_CHAT_ID was set to "@makeartalanya_bot" — the bot's own
-- username. Telegram answers `403 Forbidden: the bot can't send messages to the
-- bot`, so every admin alert since the integration shipped has failed silently.
--
-- A chat id cannot be known in advance: it only exists once a person has
-- written to the bot. Hardcoding it in an env var therefore means editing
-- Vercel config to onboard a member of staff, and getting it wrong is invisible.
--
-- Instead the bot self-registers: an admin sends /link <code> in Telegram and
-- their chat id is appended here. Alerts fan out to every id in the list.

INSERT INTO studio_settings (key, value)
VALUES ('telegram_admin_chat_ids', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.studio_settings IS
  'Runtime studio configuration. telegram_admin_chat_ids holds the Telegram chats that receive admin alerts; populate it with /link <TELEGRAM_LINK_CODE> in a chat with the bot.';
