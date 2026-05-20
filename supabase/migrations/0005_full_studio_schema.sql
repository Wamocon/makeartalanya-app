-- ═══════════════════════════════════════════════════════════════════
-- Migration 0005: Full Studio Management Schema
-- Make Art Studio Alanya — May 2026
-- ═══════════════════════════════════════════════════════════════════

-- ── Preserve legacy bookings table ─────────────────────────────────
ALTER TABLE IF EXISTS bookings RENAME TO legacy_bookings;

-- ── Add columns to profiles ────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Istanbul';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ── Children ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS children (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  birth_date  DATE NOT NULL,
  gender      TEXT CHECK (gender IN ('male','female','other')),
  medical_notes TEXT,
  emergency_contact TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parents_own_children" ON children
  FOR ALL USING (parent_id = auth.uid());
CREATE POLICY "admin_all_children" ON children
  FOR ALL USING (public.is_admin_or_trainer());

-- ── Class Types ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_types (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name_tr       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  name_ru       TEXT NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  description_ru TEXT,
  color         TEXT NOT NULL DEFAULT '#DCA8B2',
  icon          TEXT,
  duration_min  INT NOT NULL DEFAULT 60 CHECK (duration_min > 0 AND duration_min <= 480),
  max_capacity  INT NOT NULL DEFAULT 8 CHECK (max_capacity > 0 AND max_capacity <= 50),
  age_min       INT CHECK (age_min >= 0),
  age_max       INT,
  price_per_lesson NUMERIC(8,2),
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INT DEFAULT 0,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_class_types" ON class_types FOR SELECT USING (true);
CREATE POLICY "admin_manage_class_types" ON class_types
  FOR ALL USING (public.is_admin());

INSERT INTO class_types (slug, name_tr, name_en, name_ru, color, icon, duration_min, max_capacity, age_min, age_max, description_tr, description_en, description_ru) VALUES
  ('drawing', 'Resim', 'Drawing', 'Рисование', '#DCA8B2', 'palette', 60, 8, 4, NULL,
   'Yaratıcı resim dersleri: suluboya, akrilik, kalem çizim teknikleri.',
   'Creative drawing lessons: watercolor, acrylic, pencil drawing techniques.',
   'Творческие уроки рисования: акварель, акрил, техники карандашного рисунка.'),
  ('chess', 'Satranç', 'Chess', 'Шахматы', '#A9C7E5', 'crown', 60, 6, 5, 14,
   'Stratejik düşünme ve satranç eğitimi. Başlangıç ve orta seviye.',
   'Strategic thinking and chess training. Beginner and intermediate.',
   'Стратегическое мышление и обучение шахматам. Начальный и средний уровень.'),
  ('workshop', 'Master Sınıfı', 'Workshop', 'Мастер-класс', '#B8D4A8', 'sparkles', 90, 10, NULL, NULL,
   'Özel tematik atölyeler: seramik, mozaik, dijital sanat ve daha fazlası.',
   'Special themed workshops: ceramics, mosaic, digital art and more.',
   'Специальные тематические мастер-классы: керамика, мозаика, цифровое искусство.'),
  ('miniclub', 'Mini Kulüp', 'Mini Club', 'Мини-клуб', '#F2D479', 'baby', 45, 6, 3, 5,
   'Küçükler için eğlenceli sanat aktiviteleri. Parmak boyama, kolaj, oyun.',
   'Fun art activities for little ones. Finger painting, collage, play.',
   'Весёлые занятия для малышей. Рисование пальчиками, коллаж, игры.');

-- ── Schedule Templates ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_templates (
  id            SERIAL PRIMARY KEY,
  class_type_id INT NOT NULL REFERENCES class_types(id) ON DELETE CASCADE,
  trainer_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  max_capacity  INT,
  room          TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  valid_from    DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until   DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_until >= valid_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_no_trainer_overlap
  ON schedule_templates(trainer_id, day_of_week, start_time)
  WHERE is_active = TRUE AND trainer_id IS NOT NULL;

ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_templates" ON schedule_templates FOR SELECT USING (true);
CREATE POLICY "admin_manage_templates" ON schedule_templates
  FOR ALL USING (public.is_admin());

-- Seed schedule (Mon-Sat)
INSERT INTO schedule_templates (class_type_id, day_of_week, start_time, end_time, max_capacity) VALUES
  (1, 0, '10:00', '11:00', 8),  -- Mon: Drawing 10:00
  (1, 0, '14:00', '15:00', 8),  -- Mon: Drawing 14:00
  (2, 1, '15:00', '16:00', 6),  -- Tue: Chess 15:00
  (4, 1, '10:00', '10:45', 6),  -- Tue: Mini Club 10:00
  (1, 2, '10:00', '11:00', 8),  -- Wed: Drawing 10:00
  (3, 2, '16:00', '17:30', 10), -- Wed: Workshop 16:00
  (2, 3, '15:00', '16:00', 6),  -- Thu: Chess 15:00
  (4, 3, '10:00', '10:45', 6),  -- Thu: Mini Club 10:00
  (1, 4, '10:00', '11:00', 8),  -- Fri: Drawing 10:00
  (1, 4, '14:00', '15:00', 8),  -- Fri: Drawing 14:00
  (3, 5, '11:00', '12:30', 10); -- Sat: Workshop 11:00

-- ── Schedule Exceptions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_exceptions (
  id              SERIAL PRIMARY KEY,
  exception_date  DATE NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('holiday','closure','override')),
  title_tr        TEXT NOT NULL,
  title_en        TEXT,
  title_ru        TEXT,
  template_id     INT REFERENCES schedule_templates(id),
  override_start  TIME,
  override_end    TIME,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exceptions_date ON schedule_exceptions(exception_date);

ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_exceptions" ON schedule_exceptions FOR SELECT USING (true);
CREATE POLICY "admin_manage_exceptions" ON schedule_exceptions
  FOR ALL USING (public.is_admin());

-- ── Class Sessions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     INT REFERENCES schedule_templates(id) ON DELETE SET NULL,
  class_type_id   INT NOT NULL REFERENCES class_types(id),
  trainer_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  max_capacity    INT NOT NULL CHECK (max_capacity > 0),
  enrolled_count  INT NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
  status          TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  cancel_reason   TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_session_time CHECK (ends_at > starts_at),
  CONSTRAINT capacity_not_exceeded CHECK (enrolled_count <= max_capacity)
);

CREATE INDEX IF NOT EXISTS idx_sessions_starts ON class_sessions(starts_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_sessions_type ON class_sessions(class_type_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_trainer ON class_sessions(trainer_id, starts_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_duplicate_session
  ON class_sessions(class_type_id, starts_at) WHERE status != 'cancelled';

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_sessions" ON class_sessions FOR SELECT USING (true);
CREATE POLICY "admin_manage_sessions" ON class_sessions
  FOR ALL USING (public.is_admin_or_trainer());

-- ── Enhance subscriptions ──────────────────────────────────────────
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id),
  ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS max_freezes INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS freezes_used INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ── Enrollments ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id        UUID REFERENCES children(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed','cancelled','no_show','attended')),
  booked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  attended_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_enrollment
  ON enrollments(session_id, user_id, COALESCE(child_id, '00000000-0000-0000-0000-000000000000'))
  WHERE status = 'confirmed';
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_session ON enrollments(session_id, status);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_enrollments" ON enrollments
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "admin_all_enrollments" ON enrollments
  FOR ALL USING (public.is_admin_or_trainer());

-- ── Subscription Freezes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_freezes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  frozen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  planned_resume  TIMESTAMPTZ NOT NULL,
  actual_resume   TIMESTAMPTZ,
  reason          TEXT,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_freezes_sub ON subscription_freezes(subscription_id);

ALTER TABLE subscription_freezes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_freezes" ON subscription_freezes
  FOR SELECT USING (subscription_id IN (SELECT id FROM subscriptions WHERE user_id = auth.uid()));
CREATE POLICY "admin_manage_freezes" ON subscription_freezes
  FOR ALL USING (public.is_admin());

-- ── Payments ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency        TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR','TRY','USD')),
  method          TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','card','transfer')),
  received_by     UUID REFERENCES profiles(id),
  notes           TEXT,
  paid_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_sub ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_payments" ON payments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin_manage_payments" ON payments
  FOR ALL USING (public.is_admin());

-- ── Waitlist ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id    UUID REFERENCES children(id),
  position    INT NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'waiting'
              CHECK (status IN ('waiting','offered','confirmed','expired','cancelled')),
  offered_at  TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_waitlist_session ON waitlist(session_id, position) WHERE status = 'waiting';

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_waitlist" ON waitlist
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "admin_manage_waitlist" ON waitlist
  FOR ALL USING (public.is_admin());

-- Waitlist auto-position trigger
CREATE OR REPLACE FUNCTION fn_waitlist_auto_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
    FROM waitlist WHERE session_id = NEW.session_id AND status IN ('waiting','offered');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_waitlist_position
  BEFORE INSERT ON waitlist
  FOR EACH ROW EXECUTE FUNCTION fn_waitlist_auto_position();

-- ── Notifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN (
    'sub_expiring','sub_expired','sub_low','class_reminder',
    'class_cancelled','waitlist_available','booking_confirmed',
    'payment_recorded','general'
  )),
  title       TEXT NOT NULL,
  body        TEXT,
  metadata    JSONB DEFAULT '{}',
  channel     TEXT NOT NULL DEFAULT 'in_app'
              CHECK (channel IN ('in_app','telegram','email')),
  sent_at     TIMESTAMPTZ,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_mark_read" ON notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_manage_notifications" ON notifications
  FOR ALL USING (public.is_admin());

-- ── Studio Settings ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studio_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES profiles(id)
);

INSERT INTO studio_settings (key, value) VALUES
  ('cancellation_policy_hours', '24'),
  ('no_show_deducts_lesson', 'true'),
  ('max_freeze_days', '30'),
  ('waitlist_offer_hours', '2'),
  ('session_generation_weeks_ahead', '2'),
  ('default_subscription_days', '30'),
  ('booking_opens_days_ahead', '14'),
  ('class_reminder_hours_before', '24'),
  ('sub_expiry_warning_days', '3'),
  ('sub_low_lessons_threshold', '2'),
  ('studio_timezone', '"Europe/Istanbul"'),
  ('supported_languages', '["tr","en","ru"]')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE studio_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings" ON studio_settings FOR SELECT USING (true);
CREATE POLICY "admin_manage_settings" ON studio_settings
  FOR ALL USING (public.is_admin());

-- ── Audit Log ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  changes     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read_audit" ON audit_log FOR SELECT USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- ── Enrolled count maintenance ─────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE class_sessions SET enrolled_count = enrolled_count + 1 WHERE id = NEW.session_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE class_sessions SET enrolled_count = enrolled_count + 1 WHERE id = NEW.session_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      UPDATE class_sessions SET enrolled_count = enrolled_count - 1 WHERE id = NEW.session_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE class_sessions SET enrolled_count = enrolled_count - 1 WHERE id = OLD.session_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enrolled_count
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION fn_update_enrolled_count();

-- ── Subscription status auto-update ────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'frozen' THEN RETURN NEW; END IF;
  IF NEW.lessons_used >= NEW.lessons_total THEN
    NEW.status := 'exhausted';
  ELSIF NEW.expires_at IS NOT NULL AND NEW.expires_at < NOW() THEN
    NEW.status := 'expired';
  ELSE
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscription_status ON subscriptions;
CREATE TRIGGER trg_subscription_status
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION fn_update_subscription_status();

-- ── Waitlist promotion when enrollment cancelled ───────────────────
CREATE OR REPLACE FUNCTION fn_promote_waitlist()
RETURNS TRIGGER AS $$
DECLARE
  next_in_queue RECORD;
BEGIN
  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled','no_show') THEN
    SELECT * INTO next_in_queue FROM waitlist
    WHERE session_id = NEW.session_id AND status = 'waiting'
    ORDER BY position ASC LIMIT 1;
    
    IF next_in_queue IS NOT NULL THEN
      UPDATE waitlist SET
        status = 'offered',
        offered_at = NOW(),
        expires_at = NOW() + INTERVAL '2 hours'
      WHERE id = next_in_queue.id;
      
      INSERT INTO notifications (user_id, type, title, body, channel, metadata)
      VALUES (
        next_in_queue.user_id,
        'waitlist_available',
        'A spot opened up!',
        'A spot opened in your waitlisted class. Confirm within 2 hours.',
        'in_app',
        jsonb_build_object('session_id', NEW.session_id, 'waitlist_id', next_in_queue.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_promote_waitlist
  AFTER UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION fn_promote_waitlist();

-- ═══════════════════════════════════════════════════════════════════
-- SESSION GENERATION FUNCTION (called by cron)
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION generate_sessions(weeks_ahead INT DEFAULT 2)
RETURNS INT AS $$
DECLARE
  tmpl RECORD;
  session_date DATE;
  session_start TIMESTAMPTZ;
  session_end TIMESTAMPTZ;
  generated INT := 0;
  target_date DATE;
  current_dow INT;
BEGIN
  FOR tmpl IN
    SELECT st.*, ct.duration_min AS type_duration, ct.max_capacity AS type_capacity
    FROM schedule_templates st
    JOIN class_types ct ON ct.id = st.class_type_id
    WHERE st.is_active = TRUE
      AND (st.valid_until IS NULL OR st.valid_until >= CURRENT_DATE)
  LOOP
    -- Generate for each week ahead
    FOR week_offset IN 0..weeks_ahead-1 LOOP
      -- Calculate the target date for this template's day_of_week
      current_dow := EXTRACT(ISODOW FROM CURRENT_DATE)::INT - 1; -- 0=Mon
      target_date := CURRENT_DATE + (tmpl.day_of_week - current_dow + 7 * week_offset)::INT;
      
      -- Skip if date is before valid_from
      IF target_date < tmpl.valid_from THEN CONTINUE; END IF;
      -- Skip if date is after valid_until
      IF tmpl.valid_until IS NOT NULL AND target_date > tmpl.valid_until THEN CONTINUE; END IF;
      -- Skip if there's a holiday exception
      IF EXISTS (SELECT 1 FROM schedule_exceptions WHERE exception_date = target_date AND type = 'holiday') THEN
        CONTINUE;
      END IF;
      
      session_start := target_date + tmpl.start_time;
      session_end := target_date + tmpl.end_time;
      
      -- Insert only if session doesn't already exist
      INSERT INTO class_sessions (template_id, class_type_id, trainer_id, starts_at, ends_at, max_capacity)
      VALUES (
        tmpl.id,
        tmpl.class_type_id,
        tmpl.trainer_id,
        session_start,
        session_end,
        COALESCE(tmpl.max_capacity, tmpl.type_capacity)
      )
      ON CONFLICT DO NOTHING;
      
      generated := generated + 1;
    END LOOP;
  END LOOP;
  
  RETURN generated;
END;
$$ LANGUAGE plpgsql;
