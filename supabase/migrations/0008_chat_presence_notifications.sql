-- 0008 — In-app chat, admin presence, and notification enhancements
-- Adds persistent chat rooms/messages, online-presence tracking, and
-- richer in-app notifications for a professional support experience.

-- ── Notification enhancements ──────────────────────────────────────
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS link      TEXT,
  ADD COLUMN IF NOT EXISTS action_text TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read_at
  ON notifications(user_id, read_at)
  WHERE read_at IS NULL;

-- Allow 'chat_message' and 'broadcast' notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'sub_expiring','sub_expired','sub_low','class_reminder',
    'class_cancelled','waitlist_available','booking_confirmed',
    'payment_recorded','general','chat_message','broadcast'
  ));

-- ── Chat rooms ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL DEFAULT 'support'
              CHECK (type IN ('support','group')),
  title       TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_participants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member'
              CHECK (role IN ('member','admin')),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) <= 4000),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  read_at     TIMESTAMPTZ,
  edited_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created
  ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user
  ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room
  ON chat_participants(room_id);

-- ── Admin presence ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_presence (
  user_id     UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online   BOOLEAN NOT NULL DEFAULT true,
  last_seen   TIMESTAMPTZ DEFAULT NOW(),
  path        TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_presence_online
  ON admin_presence(is_online, last_seen DESC);

-- ── Row Level Security ─────────────────────────────────────────────
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_presence ENABLE ROW LEVEL SECURITY;

-- Chat rooms: visible to participants and admins/trainers
CREATE POLICY "chat_rooms_select_participants" ON chat_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_rooms.id AND cp.user_id = auth.uid()
    )
    OR public.is_admin_or_trainer()
  );

-- Chat participants: visible to self and admins/trainers
CREATE POLICY "chat_participants_select" ON chat_participants
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_trainer());

CREATE POLICY "chat_participants_insert" ON chat_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR public.is_admin_or_trainer()
  );

CREATE POLICY "chat_participants_update_own" ON chat_participants
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_or_trainer());

-- Chat messages: visible to room participants and admins/trainers
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_messages.room_id AND cp.user_id = auth.uid()
    )
    OR public.is_admin_or_trainer()
  );

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM chat_participants cp
        WHERE cp.room_id = chat_messages.room_id AND cp.user_id = auth.uid()
      )
      OR public.is_admin_or_trainer()
    )
  );

CREATE POLICY "chat_messages_update_own" ON chat_messages
  FOR UPDATE USING (sender_id = auth.uid() OR public.is_admin_or_trainer());

-- Presence: authenticated users can read all presence (so clients see admins online)
CREATE POLICY "admin_presence_select" ON admin_presence
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_presence_insert_own" ON admin_presence
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_presence_update_own" ON admin_presence
  FOR UPDATE USING (user_id = auth.uid());

-- ── Realtime ───────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;

-- ── Helper: ensure a support room exists for a user ────────────────
CREATE OR REPLACE FUNCTION ensure_support_room(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  existing_room UUID;
  new_room_id   UUID;
BEGIN
  -- Find an existing 1:1 support room for this user
  SELECT r.id INTO existing_room
  FROM chat_rooms r
  JOIN chat_participants cp ON cp.room_id = r.id
  WHERE r.type = 'support'
    AND cp.user_id = target_user_id
  LIMIT 1;

  IF existing_room IS NOT NULL THEN
    RETURN existing_room;
  END IF;

  INSERT INTO chat_rooms (type, title)
  VALUES ('support', 'Support')
  RETURNING id INTO new_room_id;

  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (new_room_id, target_user_id, 'member');

  RETURN new_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Helper: insert a notification from server-side code ────────────
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_sender_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, link, sender_id, channel, sent_at, created_at)
  VALUES (p_user_id, p_type, p_title, p_body, p_link, p_sender_id, 'in_app', NOW(), NOW())
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
